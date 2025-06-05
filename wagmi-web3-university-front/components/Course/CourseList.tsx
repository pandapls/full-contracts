import React, { useEffect } from 'react';
import { CourseCard } from './CourseCard';
import { useCourses } from '../../hooks/useCourses';
import { useAccount, useReadContract } from 'wagmi';
import { useContractActions } from '../../hooks/useContractActions';
import {
	YD_COURSE_MANAGER_ADDRESS,
	YD_COURSE_MANAGER_ABI,
} from '../../contract/YDCourseManager';

interface CourseListProps {
	limit?: number;
	showPagination?: boolean;
}

export const CourseList: React.FC<CourseListProps> = ({
	limit = 9,
	showPagination = true,
}) => {
	const {
		courses,
		loading,
		error,
		currentPage,
		totalPages,
		totalCount,
		goToPage,
		refetch,
	} = useCourses(limit);

	const { address } = useAccount();
	const { purchaseCourse, isPurchasing } = useContractActions();

	// 获取用户购买的所有课程
	const { data: userCourses, refetch: refetchUserCourses } = useReadContract({
		address: YD_COURSE_MANAGER_ADDRESS,
		abi: YD_COURSE_MANAGER_ABI,
		functionName: 'getStudentCourses',
		args: [address || '0x0'],
		query: {
			enabled: !!address,
		},
	});

	// 将购买的课程ID转换为Set以便快速查找
	const enrolledCourseIds = new Set(
		userCourses ? (userCourses as any[]).map((id) => Number(id)) : []
	);

	// 页面加载时和购买状态变化时刷新数据
	useEffect(() => {
		refetch();
		if (address) {
			refetchUserCourses();
		}
	}, [refetch, refetchUserCourses, address, isPurchasing]);

	// 监听 URL 参数变化，如果包含 refresh 参数则刷新数据
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const shouldRefresh = urlParams.get('refresh');
		const timestamp = urlParams.get('t');

		if (shouldRefresh === 'true') {
			console.log('检测到刷新参数，重新获取课程数据...');
			refetch();
			if (address) {
				refetchUserCourses();
			}

			// 清除URL参数，避免重复刷新
			const newUrl = window.location.pathname;
			window.history.replaceState({}, '', newUrl);
		}
	}, [refetch, refetchUserCourses, address]);

	// 定期刷新数据以确保同步（可选，用于处理边缘情况）
	useEffect(() => {
		const interval = setInterval(() => {
			// 静默刷新，不显示loading状态
			refetch();
			if (address) {
				refetchUserCourses();
			}
		}, 30000); // 每30秒刷新一次

		return () => clearInterval(interval);
	}, [refetch, refetchUserCourses, address]);

	// 处理路由跳转 - 避免使用useRouter
	const handleCardClick = (courseId: number) => {
		// 使用window.location进行页面跳转，避免useRouter问题
		window.location.href = `/courses/${courseId}`;
	};

	const handleManageCourse = (courseId: number) => {
		window.location.href = `/manage-course/${courseId}`;
	};

	// 处理课程购买后的刷新
	const handleEnrollSuccess = () => {
		console.log('课程购买成功，刷新数据...');
		setTimeout(() => {
			refetch();
			if (address) {
				refetchUserCourses();
			}
		}, 2000); // 给区块链一些时间确认交易
	};

	if (loading) {
		return (
			<div className='min-h-screen'>
				<div className='container mx-auto px-6 py-12'>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
						{[...Array(6)].map((_, index) => (
							<div key={index} className='animate-pulse'>
								<div className='bg-gray-800 rounded-2xl overflow-hidden border border-gray-700'>
									<div className='h-48 bg-gray-700'></div>
									<div className='p-6'>
										<div className='h-6 bg-gray-700 rounded mb-4'></div>
										<div className='h-4 bg-gray-700 rounded mb-2'></div>
										<div className='h-4 bg-gray-700 rounded mb-4 w-3/4'></div>
										<div className='flex justify-between mb-4'>
											<div className='h-8 w-20 bg-gray-700 rounded'></div>
											<div className='h-8 w-16 bg-gray-700 rounded'></div>
										</div>
										<div className='h-12 bg-gray-700 rounded'></div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='text-center'>
					<div className='text-red-500 text-6xl mb-4'>⚠️</div>
					<h2 className='text-2xl font-bold text-white mb-2'>加载失败</h2>
					<p className='text-gray-400 mb-6'>{error}</p>
					<button
						onClick={refetch}
						className='bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors'
					>
						重试
					</button>
				</div>
			</div>
		);
	}

	console.log(courses, 'courses');
	console.log(enrolledCourseIds, 'enrolledCourseIds');

	return (
		<div className='min-h-screen'>
			<div className='container mx-auto px-6 py-6'>
				{/* 页面标题 */}
				<div className='text-center mb-12'>
					<div className='mt-6 text-sm text-gray-500'>
						共找到 <span className='font-medium'>{totalCount}</span> 门课程
					</div>
				</div>

				{/* 课程网格 */}
				{courses.length > 0 ? (
					<>
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12'>
							{courses.map((course) => (
								<CourseCard
									key={course.id}
									course={course}
									isEnrolled={enrolledCourseIds.has(course.id)}
									onEnroll={handleEnrollSuccess}
									userAddress={address}
									isPurchasing={isPurchasing}
									onCardClick={handleCardClick}
									onManageCourse={handleManageCourse}
								/>
							))}
						</div>

						{/* 分页 */}
						{showPagination && totalPages > 1 && (
							<div className='flex justify-center items-center space-x-4'>
								<button
									onClick={() => goToPage(currentPage - 1)}
									disabled={currentPage === 1}
									className='px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-700 disabled:opacity-50 text-white rounded-lg transition-colors disabled:cursor-not-allowed'
								>
									上一页
								</button>

								<div className='flex space-x-2'>
									{[...Array(totalPages)].map((_, index) => {
										const page = index + 1;
										const isCurrentPage = page === currentPage;

										// 显示当前页前后各2页
										if (
											page === 1 ||
											page === totalPages ||
											(page >= currentPage - 2 && page <= currentPage + 2)
										) {
											return (
												<button
													key={page}
													onClick={() => goToPage(page)}
													className={`px-4 py-2 rounded-lg font-medium transition-colors ${
														isCurrentPage
															? 'bg-blue-500 text-white'
															: 'bg-gray-800 hover:bg-gray-700 text-gray-300'
													}`}
												>
													{page}
												</button>
											);
										} else if (
											page === currentPage - 3 ||
											page === currentPage + 3
										) {
											return (
												<span key={page} className='px-2 text-gray-500'>
													...
												</span>
											);
										}
										return null;
									})}
								</div>

								<button
									onClick={() => goToPage(currentPage + 1)}
									disabled={currentPage === totalPages}
									className='px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-700 disabled:opacity-50 text-white rounded-lg transition-colors disabled:cursor-not-allowed'
								>
									下一页
								</button>
							</div>
						)}
					</>
				) : (
					<div className='text-center py-20'>
						<div className='text-6xl mb-6'>📚</div>
						<h3 className='text-2xl font-bold text-white mb-4'>暂无课程</h3>
						<p className='text-gray-400 mb-8'>
							还没有课程，成为第一个创建课程的讲师吧！
						</p>
						<button
							onClick={() => (window.location.href = '/courses/create')}
							className='bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200'
						>
							创建课程
						</button>
					</div>
				)}
			</div>
		</div>
	);
};
