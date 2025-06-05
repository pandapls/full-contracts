'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import {
	Plus,
	Edit,
	ToggleLeft,
	ToggleRight,
	TrendingUp,
	Users,
	BookOpen,
	DollarSign,
} from 'lucide-react';
import { formatEther } from 'viem';
import { useContractActions } from '../../../hooks/useContractActions';
import { useCourses } from '../../../hooks/useCourses';
import { Button } from '../../../components/ui/Button';
import { CourseList } from '../../../components/Course/CourseList';
import { Card } from '../../../components/ui/Card';

export default function MyCoursesPage() {
	const router = useRouter();
	const { address, isConnected } = useAccount();
	const { courses, loading, refetch } = useCourses();

	// 筛选出当前用户创建的课程
	const myCourses = courses.filter((course) => course.instructor === address);

	// 计算统计数据
	const totalStudents = myCourses.reduce(
		(sum, course) => sum + course.totalStudents,
		0
	);
	const totalRevenue = myCourses.reduce((sum, course) => {
		return sum + course.totalStudents * parseFloat(formatEther(course.price));
	}, 0);
	const activeCourses = myCourses.filter((course) => course.isActive).length;

	const handleEdit = (courseId: number) => {
		router.push(`/courses/${courseId}/edit`);
	};

	const handleToggleStatus = async (courseId: number) => {
		try {
			// 调用合约方法切换课程状态
			console.log('Toggling course status:', courseId);
			refetch();
		} catch (error) {
			console.error('Failed to toggle course status:', error);
		}
	};

	if (!isConnected) {
		return (
			<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
				<div className='bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center'>
					<h2 className='text-2xl font-bold text-gray-900 mb-4'>
						连接钱包查看课程
					</h2>
					<p className='text-gray-600 mb-6'>连接您的钱包以查看和管理您的课程</p>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gray-50'>
			<div className='container mx-auto px-4 py-8'>
				{/* Header */}
				<div className='flex items-center justify-between mb-8'>
					<div>
						<h1 className='text-3xl font-bold text-gray-900'>我的课程</h1>
						<p className='text-gray-600 mt-1'>管理您创建的所有课程</p>
					</div>
					<Button
						onClick={() => router.push('/courses/create')}
						leftIcon={<Plus size={20} />}
					>
						创建新课程
					</Button>
				</div>

				{/* Stats Cards */}
				<div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
					<Card className='p-6'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm font-medium text-gray-600'>课程总数</p>
								<p className='text-2xl font-bold text-gray-900'>
									{myCourses.length}
								</p>
							</div>
							<div className='p-3 bg-blue-100 rounded-lg'>
								<BookOpen size={24} className='text-blue-600' />
							</div>
						</div>
					</Card>

					<Card className='p-6'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm font-medium text-gray-600'>总学生数</p>
								<p className='text-2xl font-bold text-gray-900'>
									{totalStudents}
								</p>
							</div>
							<div className='p-3 bg-green-100 rounded-lg'>
								<Users size={24} className='text-green-600' />
							</div>
						</div>
					</Card>

					<Card className='p-6'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm font-medium text-gray-600'>总收入</p>
								<p className='text-2xl font-bold text-gray-900'>
									{totalRevenue.toFixed(2)} YDT
								</p>
							</div>
							<div className='p-3 bg-purple-100 rounded-lg'>
								<DollarSign size={24} className='text-purple-600' />
							</div>
						</div>
					</Card>

					<Card className='p-6'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm font-medium text-gray-600'>活跃课程</p>
								<p className='text-2xl font-bold text-gray-900'>
									{activeCourses}
								</p>
							</div>
							<div className='p-3 bg-orange-100 rounded-lg'>
								<TrendingUp size={24} className='text-orange-600' />
							</div>
						</div>
					</Card>
				</div>

				{/* Course List */}
				<Card>
					<div className='p-6 border-b border-gray-200'>
						<h2 className='text-lg font-semibold text-gray-900'>课程管理</h2>
					</div>
					<div className='p-6'>
						{loading ? (
							<div className='text-center py-8'>
								<div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
								<p className='mt-2 text-gray-600'>加载中...</p>
							</div>
						) : myCourses.length === 0 ? (
							<div className='text-center py-12'>
								<BookOpen size={48} className='mx-auto text-gray-400 mb-4' />
								<h3 className='text-lg font-medium text-gray-900 mb-2'>
									还没有创建课程
								</h3>
								<p className='text-gray-600 mb-4'>
									创建您的第一个课程开始赚取收入
								</p>
								<Button onClick={() => router.push('/courses/create')}>
									创建课程
								</Button>
							</div>
						) : (
							<CourseList
							/>
						)}
					</div>
				</Card>
			</div>
		</div>
	);
}
