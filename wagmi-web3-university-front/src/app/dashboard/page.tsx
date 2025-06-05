'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import {
	BookOpen,
	Users,
	DollarSign,
	TrendingUp,
	Play,
	CheckCircle,
	Plus,
	BarChart3,
	PieChart,
	Activity,
} from 'lucide-react';
import { formatEther } from 'viem';
import { useCourses } from '../../../hooks/useCourses';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { useTokenBalance } from '../../../hooks/useTokenBalance';

export default function DashboardPage() {
	const router = useRouter();
	const { address, isConnected } = useAccount();
	const { courses, loading } = useCourses();
	const { formattedBalance } = useTokenBalance(address);

	// 用户角色检测 - 根据是否创建过课程判断
	const userCourses = courses.filter((course) => course.instructor === address);
	const isInstructor = userCourses.length > 0;

	// 模拟学生购买的课程数据
	const [enrolledCourses, setEnrolledCourses] = useState<number[]>([]);

	if (!isConnected) {
		return (
			<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
				<div className='bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center'>
					<Activity size={48} className='mx-auto text-blue-600 mb-4' />
					<h2 className='text-2xl font-bold text-gray-900 mb-4'>
						欢迎来到学习平台
					</h2>
					<p className='text-gray-600 mb-6'>连接您的钱包开始学习之旅</p>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gray-50'>
			<div className='container mx-auto px-4 py-8'>
				{/* Header */}
				<div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8'>
					<div>
						<h1 className='text-3xl font-bold text-gray-900'>欢迎回来！</h1>
						<p className='text-gray-600 mt-1'>
							{isInstructor ? '管理您的课程和学生' : '继续您的学习之旅'}
						</p>
					</div>

					<div className='flex items-center gap-4'>
						{/* <TokenBalanceCard address={address!} /> */}
						{isInstructor ? (
							<Button
								onClick={() => router.push('/courses/create')}
								leftIcon={<Plus size={20} />}
							>
								创建课程
							</Button>
						) : (
							<Button
								onClick={() => router.push('/courses')}
								leftIcon={<BookOpen size={20} />}
							>
								浏览课程
							</Button>
						)}
					</div>
				</div>

				{/* Role-based Dashboard */}
				{/* {isInstructor ? (
					<InstructorDashboard
						courses={userCourses}
						totalBalance={formattedBalance}
					/>
				) : (
					<StudentDashboard
						enrolledCourseIds={enrolledCourses}
						allCourses={courses}
					/>
				)} */}

				{/* Quick Actions */}
				<Card className='mt-8'>
					<div className='p-6 border-b border-gray-200'>
						<h2 className='text-lg font-semibold text-gray-900'>快捷操作</h2>
					</div>
					<div className='p-6'>
						<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
							<Button
								variant='outline'
								onClick={() => router.push('/courses')}
								className='h-20 flex-col'
							>
								<BookOpen size={24} className='mb-2' />
								浏览课程
							</Button>

							{isInstructor ? (
								<>
									<Button
										variant='outline'
										onClick={() => router.push('/courses/create')}
										className='h-20 flex-col'
									>
										<Plus size={24} className='mb-2' />
										创建课程
									</Button>
								</>
							) : (
								<>
									<Button
										variant='outline'
										onClick={() => router.push('/my-learning')}
										className='h-20 flex-col'
									>
										<Play size={24} className='mb-2' />
										我的学习
									</Button>
									<Button
										variant='outline'
										onClick={() => router.push('/')}
										className='h-20 flex-col'
									>
										<DollarSign size={24} className='mb-2' />
										购买代币
									</Button>
								</>
							)}
						</div>
					</div>
				</Card>
			</div>
		</div>
	);
}
