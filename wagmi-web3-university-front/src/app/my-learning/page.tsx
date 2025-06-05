'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { BookOpen, Play, CheckCircle, Clock } from 'lucide-react';
import { CourseProgressCard } from '../../../components/Course/CourseProgressCard';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { useCourses } from '../../../hooks/useCourses';

export default function MyLearningPage() {
	const router = useRouter();
	const { address, isConnected } = useAccount();
	const { courses } = useCourses();

	// 这里应该从合约或API获取用户已购买的课程ID
	const [enrolledCourseIds, setEnrolledCourseIds] = useState<number[]>([]);
	const [learningProgress, setLearningProgress] = useState<
		Record<number, number>
	>({});

	// 筛选出已购买的课程
	const enrolledCourses = courses.filter((course) =>
		enrolledCourseIds.includes(course.id)
	);

	// 分类课程
	const inProgressCourses = enrolledCourses.filter((course) => {
		const progress = learningProgress[course.id] || 0;
		return progress > 0 && progress < 100;
	});

	const completedCourses = enrolledCourses.filter((course) => {
		const progress = learningProgress[course.id] || 0;
		return progress >= 100;
	});

	const notStartedCourses = enrolledCourses.filter((course) => {
		const progress = learningProgress[course.id] || 0;
		return progress === 0;
	});

	if (!isConnected) {
		return (
			<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
				<div className='bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center'>
					<h2 className='text-2xl font-bold text-gray-900 mb-4'>
						连接钱包查看学习记录
					</h2>
					<p className='text-gray-600 mb-6'>连接您的钱包以查看已购买的课程</p>
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
						<h1 className='text-3xl font-bold text-gray-900'>我的学习</h1>
						<p className='text-gray-600 mt-1'>继续您的学习之旅</p>
					</div>
					<Button onClick={() => router.push('/courses')}>浏览更多课程</Button>
				</div>

				{/* Stats Overview */}
				<div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
					<Card className='p-6'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm font-medium text-gray-600'>已购买课程</p>
								<p className='text-2xl font-bold text-gray-900'>
									{enrolledCourses.length}
								</p>
							</div>
							<BookOpen size={24} className='text-blue-600' />
						</div>
					</Card>

					<Card className='p-6'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm font-medium text-gray-600'>学习中</p>
								<p className='text-2xl font-bold text-gray-900'>
									{inProgressCourses.length}
								</p>
							</div>
							<Play size={24} className='text-orange-600' />
						</div>
					</Card>

					<Card className='p-6'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm font-medium text-gray-600'>已完成</p>
								<p className='text-2xl font-bold text-gray-900'>
									{completedCourses.length}
								</p>
							</div>
							<CheckCircle size={24} className='text-green-600' />
						</div>
					</Card>
				</div>

				{enrolledCourses.length === 0 ? (
					<Card className='p-12 text-center'>
						<BookOpen size={48} className='mx-auto text-gray-400 mb-4' />
						<h3 className='text-lg font-medium text-gray-900 mb-2'>
							还没有购买课程
						</h3>
						<p className='text-gray-600 mb-4'>浏览课程市场发现感兴趣的课程</p>
						<Button onClick={() => router.push('/courses')}>浏览课程</Button>
					</Card>
				) : (
					<div className='space-y-8'>
						{/* Continue Learning */}
						{inProgressCourses.length > 0 && (
							<section>
								<h2 className='text-xl font-semibold text-gray-900 mb-4'>
									继续学习
								</h2>
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
									{inProgressCourses.map((course) => (
										<CourseProgressCard
											key={course.id}
											course={course}
											progress={learningProgress[course.id] || 0}
											onContinue={() =>
												router.push(`/courses/${course.id}/learn`)
											}
										/>
									))}
								</div>
							</section>
						)}

						{/* Not Started */}
						{notStartedCourses.length > 0 && (
							<section>
								<h2 className='text-xl font-semibold text-gray-900 mb-4'>
									新课程
								</h2>
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
									{notStartedCourses.map((course) => (
										<CourseProgressCard
											key={course.id}
											course={course}
											progress={0}
											onContinue={() =>
												router.push(`/courses/${course.id}/learn`)
											}
										/>
									))}
								</div>
							</section>
						)}

						{/* Completed */}
						{completedCourses.length > 0 && (
							<section>
								<h2 className='text-xl font-semibold text-gray-900 mb-4'>
									已完成课程
								</h2>
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
									{completedCourses.map((course) => (
										<CourseProgressCard
											key={course.id}
											course={course}
											progress={100}
											onContinue={() =>
												router.push(`/courses/${course.id}/review`)
											}
										/>
									))}
								</div>
							</section>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
