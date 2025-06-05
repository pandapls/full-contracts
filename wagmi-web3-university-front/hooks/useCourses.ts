import { useState, useEffect, useCallback } from 'react';
import { useReadContract } from 'wagmi';
import {
    YD_COURSE_MANAGER_ABI,
    YD_COURSE_MANAGER_ADDRESS,
} from '../contract/YDCourseManager';
import { useIPFSData } from './useIPFSData';
import { Course } from '../types/Course.type';

export const useCourses = (limit = 10) => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const offset = (currentPage - 1) * limit;
    const totalPages = Math.ceil(totalCount / limit);

    // 获取课程列表
    const {
        data: coursesData,
        isLoading: isContractLoading,
        refetch,
    } = useReadContract({
        address: YD_COURSE_MANAGER_ADDRESS,
        abi: YD_COURSE_MANAGER_ABI,
        functionName: 'getActiveCourses',
        args: [BigInt(offset), BigInt(limit)],
    });

    // 处理课程数据和 IPFS 数据
    useEffect(() => {
        const loadCoursesWithIPFS = async () => {
            if (!coursesData) return;

            setLoading(true);
            try {
                const [coursesList, total] = coursesData as [any[], bigint];

                // 为每个课程获取 IPFS 数据
                const coursesWithIPFS = await Promise.all(
                    coursesList.map(async (courseData) => {
                        const baseCourse: Course = {
                            id: Number(courseData.id),
                            ipfsCid: courseData.ipfsCid,
                            price: courseData.price,
                            instructor: courseData.instructor,
                            isActive: courseData.isActive,
                            createdAt: Number(courseData.createdAt),
                            totalStudents: Number(courseData.totalStudents),
                            title: '',
                            description: '',
                            imageUrl: '',
                            contentUrls: []
                        };

                        // 如果有 IPFS CID，尝试获取元数据
                        if (courseData.ipfsCid) {
                            try {
                                const response = await fetch(
                                    `https://ipfs.io/ipfs/${courseData.ipfsCid}`
                                );
                                if (response.ok) {
                                    const ipfsData = await response.json();
                                    return {
                                        ...baseCourse,
                                        title: ipfsData.title,
                                        description: ipfsData.description,
                                        imageUrl: ipfsData.imageUrl,
                                        category: ipfsData.category,
                                        tags: ipfsData.tags,
                                        level: ipfsData.level,
                                        duration: ipfsData.duration,
                                    };
                                }
                            } catch (ipfsError) {
                                console.warn(
                                    `Failed to load IPFS data for course ${baseCourse.id}:`,
                                    ipfsError
                                );
                            }
                        }

                        return baseCourse;
                    })
                );

                setCourses(coursesWithIPFS);
                setTotalCount(Number(total));
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load courses');
            } finally {
                setLoading(false);
            }
        };

        loadCoursesWithIPFS();
    }, [coursesData]);

    const fetchCourses = useCallback(() => {
        setLoading(true);
        setError(null);
        refetch()
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [refetch]);

    const goToPage = useCallback(
        (page: number) => {
            if (page >= 1 && page <= totalPages) {
                setCurrentPage(page);
            }
        },
        [totalPages]
    );

    return {
        courses,
        loading: loading || isContractLoading,
        error,
        currentPage,
        totalPages,
        totalCount,
        fetchCourses,
        goToPage,
        refetch: fetchCourses,
    };
};