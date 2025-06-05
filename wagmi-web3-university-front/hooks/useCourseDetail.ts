import { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import {
	YD_COURSE_MANAGER_ADDRESS,
	YD_COURSE_MANAGER_ABI,
} from '../contract/YDCourseManager';
import { Course, CourseOnChain } from '../types/Course.type';

// Pinata 配置
const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';
const PINATA_API_URL = 'https://api.pinata.cloud';

// 备用IPFS网关（如果Pinata失败）
const BACKUP_GATEWAYS = [
	'https://ipfs.io/ipfs/',
	'https://cloudflare-ipfs.com/ipfs/',
	'https://dweb.link/ipfs/',
];

// IPFS数据接口
interface IPFSCourseData {
	title: string;
	description: string;
	imageUrl: string;
	contentUrls: string[];
	category?: string;
	tags?: string[];
	level?: string;
	duration?: string;
}

export const useCourseDetail = (courseId: number) => {
	const [course, setCourse] = useState<Course | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [ipfsLoading, setIpfsLoading] = useState(false);
	const { address } = useAccount();

	// 获取链上课程基本信息
	const {
		data: courseData,
		isLoading: isLoadingCourse,
		refetch: refetchCourse,
		error: courseError,
	} = useReadContract({
		address: YD_COURSE_MANAGER_ADDRESS,
		abi: YD_COURSE_MANAGER_ABI,
		functionName: 'getCourse',
		args: [BigInt(courseId)],
		query: {
			enabled: courseId > 0,
		},
	});

	// 检查是否已购买
	const {
		data: isEnrolled,
		refetch: refetchEnrollment,
		error: enrollmentError,
	} = useReadContract({
		address: YD_COURSE_MANAGER_ADDRESS,
		abi: YD_COURSE_MANAGER_ABI,
		functionName: 'checkEnrollment',
		args: [BigInt(courseId), address || '0x0'],
		query: {
			enabled: courseId > 0 && !!address,
		},
	});

	// 从Pinata获取IPFS数据
	const fetchFromPinata = useCallback(
		async (cid: string): Promise<IPFSCourseData | null> => {
			if (!cid) return null;

			setIpfsLoading(true);

			try {
				console.log(`从 Pinata 获取 IPFS 数据:`, cid);

				// 首先尝试Pinata网关
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), 8000); // 8秒超时

				const response = await fetch(`${PINATA_GATEWAY}${cid}`, {
					method: 'GET',
					headers: {
						Accept: 'application/json',
						'Cache-Control': 'no-cache',
					},
					signal: controller.signal,
				});

				clearTimeout(timeoutId);

				if (!response.ok) {
					throw new Error(`Pinata HTTP error! status: ${response.status}`);
				}

				const data = await response.json();

				// 验证数据结构
				if (!data.title || !data.description) {
					throw new Error('Invalid IPFS data structure from Pinata');
				}

				console.log('Pinata 数据获取成功:', data);
				return data;
			} catch (err) {
				console.warn('Pinata 获取失败，尝试备用网关:', err);

				// 如果Pinata失败，尝试备用网关
				for (const gateway of BACKUP_GATEWAYS) {
					try {
						console.log(`尝试备用网关: ${gateway}`);

						const controller = new AbortController();
						const timeoutId = setTimeout(() => controller.abort(), 6000); // 6秒超时

						const response = await fetch(`${gateway}${cid}`, {
							method: 'GET',
							headers: { Accept: 'application/json' },
							signal: controller.signal,
						});

						clearTimeout(timeoutId);

						if (!response.ok) {
							throw new Error(`HTTP error! status: ${response.status}`);
						}

						const data = await response.json();

						if (!data.title || !data.description) {
							throw new Error('Invalid IPFS data structure');
						}

						console.log(`备用网关 ${gateway} 获取成功:`, data);
						return data;
					} catch (backupErr) {
						console.warn(`备用网关 ${gateway} 失败:`, backupErr);
						continue;
					}
				}

				throw new Error('所有IPFS网关（包括Pinata）都无法访问');
			}
		},
		[]
	);

	// 组合链上数据和IPFS数据
	useEffect(() => {
		if (!courseData) return;

		const loadCourseWithIPFS = async () => {
			try {
				const chainData = courseData as any;
				console.log('链上数据:', chainData);

				// 转换链上数据
				const courseOnChain: CourseOnChain = {
					id: Number(chainData.id),
					ipfsCid: chainData.ipfsCid,
					price: chainData.price,
					instructor: chainData.instructor,
					isActive: chainData.isActive,
					createdAt: Number(chainData.createdAt),
					totalStudents: Number(chainData.totalStudents),
				};

				// 如果有IPFS CID，尝试获取IPFS数据
				let ipfsData: IPFSCourseData | null = null;

				if (chainData.ipfsCid) {
					try {
						ipfsData = await fetchFromPinata(chainData.ipfsCid);
					} catch (ipfsError) {
						console.error('所有IPFS网关都失败:', ipfsError);
						// IPFS失败时不设置错误，使用默认值
					}
				}

				// 组合完整的课程数据
				const combinedCourse: Course = {
					...courseOnChain,
					// IPFS数据，有默认值
					title: ipfsData?.title || `课程 #${courseOnChain.id}`,
					description: ipfsData?.description || '课程详情加载中...',
					imageUrl: ipfsData?.imageUrl || '',
					contentUrls: ipfsData?.contentUrls || [],
					category: ipfsData?.category,
					tags: ipfsData?.tags,
					level: ipfsData?.level,
					duration: ipfsData?.duration,
				};

				setCourse(combinedCourse);
				setError(null);
			} catch (err) {
				console.error('处理课程数据失败:', err);
				setError('处理课程数据失败');
			} finally {
				setIpfsLoading(false);
			}
		};

		loadCourseWithIPFS();
	}, [courseData, fetchFromPinata]);

	// 处理链上数据错误
	useEffect(() => {
		if (courseError) {
			console.error('链上数据获取失败:', courseError);
			setError(courseError.message || '获取课程失败');
		}
	}, [courseError]);

	// 手动刷新课程数据 - 修复TypeScript错误
	const refetch = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			// 分别处理不同类型的refetch，避免类型冲突
			await refetchCourse();

			// 只有在有地址时才刷新购买状态
			if (address) {
				await refetchEnrollment();
			}
		} catch (err) {
			console.error('刷新数据失败:', err);
			setError(err instanceof Error ? err.message : '刷新失败');
		} finally {
			setLoading(false);
		}
	}, [refetchCourse, refetchEnrollment, address]);

	// 计算总的加载状态
	const totalLoading = loading || isLoadingCourse || ipfsLoading;

	// 调试信息
	useEffect(() => {
		if (courseId > 0) {
			console.log('useCourseDetail (Pinata版) 调试信息:', {
				courseId,
				courseData,
				course,
				isLoadingCourse,
				ipfsLoading,
				loading,
				error,
				isEnrolled,
				pinataGateway: PINATA_GATEWAY,
			});
		}
	}, [
		courseId,
		courseData,
		course,
		isLoadingCourse,
		ipfsLoading,
		loading,
		error,
		isEnrolled,
	]);

	return {
		course,
		isEnrolled: Boolean(isEnrolled),
		loading: totalLoading,
		error: error || enrollmentError?.message || null,
		refetch,
	};
};
