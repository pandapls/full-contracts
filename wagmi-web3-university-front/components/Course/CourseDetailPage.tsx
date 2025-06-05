'use client';
import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { useCourseDetail } from '../../hooks/useCourseDetail';
import { useContractActions } from '../../hooks/useContractActions';
import { useTokenBalance } from '../../hooks/useTokenBalance';
import { useParams, useRouter } from 'next/navigation';

export const CourseDetailPage: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const courseId = parseInt(id) || 0;
	const router = useRouter();
	const { address } = useAccount();
	const { course, isEnrolled, loading, error, refetch } =
		useCourseDetail(courseId);
	const { formattedBalance } = useTokenBalance(address);

	const {
		purchaseCourse,
		isPurchasing,
		isWaitingForPurchase,
		isPurchaseSuccess,
		handleApprove,
		isApproving,
		isWaitingForApprove,
		isApproveSuccess,
		allowance,
		ydtBalance,
		refetchAllowance,
	} = useContractActions();

	const [showToast, setShowToast] = useState<{
		message: string;
		type: 'success' | 'error' | 'info';
	} | null>(null);
	const [purchaseStep, setPurchaseStep] = useState<
		'idle' | 'approving' | 'purchasing' | 'completed'
	>('idle');

	// Helper functions
	const formatAddress = (address: string) => {
		return `${address.slice(0, 6)}...${address.slice(-4)}`;
	};

	const formatDate = (timestamp: number) => {
		return new Date(timestamp * 1000).toLocaleDateString('zh-CN');
	};

	const displayToast = (
		message: string,
		type: 'success' | 'error' | 'info' = 'info'
	) => {
		setShowToast({ message, type });
		setTimeout(() => setShowToast(null), 5000);
	};

	// 判断是否是自己的课程
	const isOwnCourse =
		address?.toLowerCase() === course?.instructor.toLowerCase();

	// 检查是否需要授权
	const needsApproval = () => {
		if (!course || !allowance) return true;
		return allowance < course.price;
	};

	// 检查YDT余额是否足够
	const hasEnoughBalance = () => {
		if (!course || !ydtBalance) return false;
		return ydtBalance >= course.price;
	};

	// 处理授权成功
	useEffect(() => {
		if (isApproveSuccess && purchaseStep === 'approving') {
			displayToast('授权成功，正在购买课程...', 'success');
			setPurchaseStep('purchasing');
			refetchAllowance();

			// 自动开始购买
			setTimeout(() => {
				handlePurchaseCourse();
			}, 1000);
		}
	}, [isApproveSuccess, purchaseStep]);

	// 处理购买成功
	useEffect(() => {
		if (isPurchaseSuccess && purchaseStep === 'purchasing') {
			displayToast('购买成功！课程已添加到您的学习列表', 'success');
			setPurchaseStep('completed');
			refetch();
		}
	}, [isPurchaseSuccess, purchaseStep]);

	// 实际的购买逻辑
	const handlePurchaseCourse = async () => {
		if (!course) return;

		try {
			await purchaseCourse(courseId);
		} catch (error) {
			console.error('Purchase failed:', error);
			displayToast('购买失败，请重试', 'error');
			setPurchaseStep('idle');
		}
	};

	// 主购买函数
	const handlePurchase = async () => {
		if (!address) {
			displayToast('请先连接钱包', 'error');
			return;
		}

		if (isOwnCourse) {
			displayToast('不能购买自己的课程', 'error');
			return;
		}

		if (!course) {
			displayToast('课程信息加载中，请稍候', 'error');
			return;
		}

		if (!hasEnoughBalance()) {
			displayToast(
				`YDT余额不足，需要 ${formatEther(course.price)} YDT，当前余额 ${formattedBalance} YDT`,
				'error'
			);
			return;
		}

		try {
			if (needsApproval()) {
				// 需要先授权
				displayToast('正在授权YDT代币...', 'info');
				setPurchaseStep('approving');
				await handleApprove(formatEther(course.price));
			} else {
				// 直接购买
				displayToast('正在购买课程...', 'info');
				setPurchaseStep('purchasing');
				await handlePurchaseCourse();
			}
		} catch (error: any) {
			console.error('Purchase process failed:', error);

			let errorMessage = '操作失败，请重试';
			if (error.message?.includes('User rejected')) {
				errorMessage = '交易被取消';
			} else if (error.message?.includes('insufficient funds')) {
				errorMessage = 'ETH余额不足支付Gas费';
			} else if (error.message?.includes('Insufficient YDT balance')) {
				errorMessage = 'YDT余额不足';
			}

			displayToast(errorMessage, 'error');
			setPurchaseStep('idle');
		}
	};

	// 获取按钮状态和文本
	const getButtonState = () => {
		if (!address) {
			return {
				text: '请先连接钱包',
				disabled: true,
				className:
					'w-full bg-gray-600 text-white py-4 rounded-xl font-medium text-lg cursor-not-allowed',
			};
		}

		if (isOwnCourse) {
			return {
				text: '管理课程',
				disabled: false,
				className:
					'w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-4 rounded-xl font-medium transition-all duration-200 text-lg',
			};
		}

		if (isEnrolled) {
			return {
				text: '✓ 已购买',
				disabled: true,
				className:
					'w-full bg-green-600 text-white py-4 rounded-xl font-medium text-lg',
			};
		}

		if (!hasEnoughBalance()) {
			return {
				text: `余额不足 (需要 ${course ? formatEther(course.price) : '0'} YDT)`,
				disabled: true,
				className:
					'w-full bg-red-600 text-white py-4 rounded-xl font-medium text-lg cursor-not-allowed',
			};
		}

		const isProcessing =
			purchaseStep !== 'idle' ||
			isPurchasing ||
			isApproving ||
			isWaitingForPurchase ||
			isWaitingForApprove;

		if (isProcessing) {
			let text = '处理中...';
			if (purchaseStep === 'approving' || isApproving || isWaitingForApprove) {
				text = '授权中...';
			} else if (
				purchaseStep === 'purchasing' ||
				isPurchasing ||
				isWaitingForPurchase
			) {
				text = '购买中...';
			}

			return {
				text,
				disabled: true,
				className:
					'w-full bg-blue-400 text-white py-4 rounded-xl font-medium text-lg cursor-not-allowed',
			};
		}

		return {
			text: `立即购买 (${course ? formatEther(course.price) : '0'} YDT)`,
			disabled: false,
			className:
				'w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-4 rounded-xl font-medium transition-all duration-200 text-lg',
		};
	};

	const buttonState = getButtonState();

	const handleButtonClick = () => {
		if (isOwnCourse) {
			router.push(`/manage-course/${course?.id}`);
		} else if (isEnrolled) {
			// 已购买，可以查看课程内容
			return;
		} else {
			handlePurchase();
		}
	};

	// Loading state
	if (loading) {
		return (
			<div className='min-h-screen bg-gray-900'>
				<div className='container mx-auto px-6 py-12'>
					<div className='animate-pulse'>
						{/* 返回按钮骨架 */}
						<div className='h-6 bg-gray-700 rounded w-20 mb-8'></div>

						<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
							<div className='lg:col-span-2'>
								{/* 封面骨架 */}
								<div className='h-64 lg:h-80 bg-gray-700 rounded-2xl mb-8'></div>

								{/* 标题骨架 */}
								<div className='h-8 bg-gray-700 rounded w-3/4 mb-4'></div>

								{/* 讲师信息骨架 */}
								<div className='flex items-center space-x-6 mb-6'>
									<div className='flex items-center space-x-2'>
										<div className='w-10 h-10 bg-gray-700 rounded-full'></div>
										<div>
											<div className='h-4 bg-gray-700 rounded w-12 mb-1'></div>
											<div className='h-4 bg-gray-700 rounded w-20'></div>
										</div>
									</div>
									<div className='text-center'>
										<div className='h-4 bg-gray-700 rounded w-12 mb-1'></div>
										<div className='h-4 bg-gray-700 rounded w-8'></div>
									</div>
								</div>

								{/* 描述骨架 */}
								<div className='space-y-2 mb-8'>
									<div className='h-4 bg-gray-700 rounded'></div>
									<div className='h-4 bg-gray-700 rounded w-5/6'></div>
									<div className='h-4 bg-gray-700 rounded w-4/6'></div>
								</div>
							</div>

							{/* 侧边栏骨架 */}
							<div className='lg:col-span-1'>
								<div className='bg-gray-800 rounded-2xl p-6'>
									<div className='text-center mb-6'>
										<div className='h-8 bg-gray-700 rounded w-24 mx-auto mb-2'></div>
										<div className='h-4 bg-gray-700 rounded w-16 mx-auto'></div>
									</div>
									<div className='h-12 bg-gray-700 rounded'></div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className='min-h-screen bg-gray-900 flex items-center justify-center'>
				<div className='text-center'>
					<div className='text-red-500 text-6xl mb-4'>⚠️</div>
					<h2 className='text-2xl font-bold text-white mb-2'>加载失败</h2>
					<p className='text-gray-400 mb-6'>{error}</p>
					<div className='space-x-4'>
						<button
							onClick={() => refetch()}
							className='bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors'
						>
							重试
						</button>
						<button
							onClick={() => router.back()}
							className='bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-colors'
						>
							返回
						</button>
					</div>
				</div>
			</div>
		);
	}

	// Course not found
	if (!course) {
		return (
			<div className='min-h-screen bg-gray-900 flex items-center justify-center'>
				<div className='text-center'>
					<div className='text-gray-500 text-6xl mb-4'>📚</div>
					<h2 className='text-2xl font-bold text-white mb-2'>课程不存在</h2>
					<p className='text-gray-400 mb-6'>该课程可能已被删除或ID无效</p>
					<button
						onClick={() => router.back()}
						className='bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors'
					>
						返回
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gray-900'>
			{/* Toast notification */}
			{showToast && (
				<div
					className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border flex items-center space-x-3 min-w-80 ${
						showToast.type === 'success'
							? 'bg-green-500 text-white'
							: showToast.type === 'error'
								? 'bg-red-500 text-white'
								: 'bg-blue-500 text-white'
					}`}
				>
					<span className='text-lg'>
						{showToast.type === 'success'
							? '✅'
							: showToast.type === 'error'
								? '❌'
								: 'ℹ️'}
					</span>
					<span className='font-medium'>{showToast.message}</span>
					<button
						onClick={() => setShowToast(null)}
						className='text-white hover:text-gray-200 ml-4 text-xl'
					>
						×
					</button>
				</div>
			)}

			<div className='container mx-auto px-6 py-12'>
				{/* 返回按钮 */}
				<button
					onClick={() => router.back()}
					className='flex items-center space-x-2 text-gray-400 hover:text-white mb-8 transition-colors'
				>
					<span>←</span>
					<span>返回</span>
				</button>

				<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
					{/* 主要内容 */}
					<div className='lg:col-span-2'>
						{/* 课程封面 */}
						<div className='relative mb-8 rounded-2xl overflow-hidden'>
							<img
								src={
									course.imageUrl ||
									'https://via.placeholder.com/800x400/374151/9CA3AF?text=Course+Image'
								}
								alt={course.title}
								className='w-full h-64 lg:h-80 object-cover'
								onError={(e) => {
									const target = e.target as HTMLImageElement;
									target.src =
										'https://via.placeholder.com/800x400/374151/9CA3AF?text=Course+Image';
								}}
							/>

							{/* 状态标签 */}
							<div className='absolute top-4 left-4 flex space-x-2'>
								{isOwnCourse && (
									<div className='bg-green-500 rounded-lg px-3 py-1'>
										<span className='text-white text-sm font-medium'>
											我的课程
										</span>
									</div>
								)}
								{!isOwnCourse && isEnrolled && (
									<div className='bg-blue-500 rounded-lg px-3 py-1'>
										<span className='text-white text-sm font-medium'>
											已购买
										</span>
									</div>
								)}
								{course.ipfsCid && (
									<div className='bg-purple-500 rounded-lg px-3 py-1'>
										<span className='text-white text-sm font-medium'>IPFS</span>
									</div>
								)}
							</div>
						</div>

						{/* 课程信息 */}
						<div className='mb-8'>
							<h1 className='text-3xl lg:text-4xl font-bold text-white mb-4'>
								{course.title}
							</h1>

							<div className='flex items-center space-x-6 mb-6 text-gray-400'>
								<div className='flex items-center space-x-2'>
									<div className='w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center'>
										<span className='text-white text-sm font-bold'>
											{course.instructor.slice(2, 4).toUpperCase()}
										</span>
									</div>
									<div>
										<p className='text-sm'>{isOwnCourse ? '我' : '讲师'}</p>
										<p className='text-white font-medium'>
											{isOwnCourse ? '我' : formatAddress(course.instructor)}
										</p>
									</div>
								</div>

								<div className='text-center'>
									<p className='text-sm'>学生数</p>
									<p className='text-white font-medium'>
										{course.totalStudents}
									</p>
								</div>

								<div className='text-center'>
									<p className='text-sm'>创建时间</p>
									<p className='text-white font-medium'>
										{formatDate(course.createdAt)}
									</p>
								</div>

								{course.category && (
									<div className='text-center'>
										<p className='text-sm'>分类</p>
										<p className='text-white font-medium'>{course.category}</p>
									</div>
								)}
							</div>

							<p className='text-gray-300 text-lg leading-relaxed mb-6'>
								{course.description}
							</p>

							{/* 标签 */}
							{course.tags && course.tags.length > 0 && (
								<div className='flex flex-wrap gap-2 mb-6'>
									{course.tags.map((tag, index) => (
										<span
											key={index}
											className='bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm'
										>
											{tag}
										</span>
									))}
								</div>
							)}
						</div>

						{/* 课程内容 */}
						{(isEnrolled || isOwnCourse) &&
							course.contentUrls &&
							course.contentUrls.length > 0 && (
								<div className='bg-gray-800 rounded-2xl p-6'>
									<h2 className='text-2xl font-bold text-white mb-4'>
										课程内容
									</h2>
									<div className='space-y-3'>
										{course.contentUrls.map((url, index) => (
											<div
												key={index}
												className='flex items-center space-x-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors'
											>
												<span className='text-blue-400 font-bold text-sm'>
													{String(index + 1).padStart(2, '0')}
												</span>
												<a
													href={url}
													target='_blank'
													rel='noopener noreferrer'
													className='text-white hover:text-blue-400 transition-colors flex-1'
												>
													课程内容 {index + 1}
												</a>
												<span className='text-gray-400'>🔗</span>
											</div>
										))}
									</div>
								</div>
							)}

						{/* 未购买时的内容预览 */}
						{!isEnrolled && !isOwnCourse && (
							<div className='bg-gray-800 rounded-2xl p-6'>
								<h2 className='text-2xl font-bold text-white mb-4'>课程内容</h2>
								<div className='text-center py-12'>
									<div className='text-6xl mb-4'>🔒</div>
									<h3 className='text-xl font-bold text-white mb-2'>
										购买后可查看课程内容
									</h3>
									<p className='text-gray-400'>
										该课程包含 {course.contentUrls?.length || 0} 个学习内容
									</p>
								</div>
							</div>
						)}
					</div>

					{/* 侧边栏 */}
					<div className='lg:col-span-1'>
						<div className='bg-gray-800 rounded-2xl p-6 sticky top-6'>
							<div className='text-center mb-6'>
								<div className='text-3xl font-bold text-white mb-2'>
									{formatEther(course.price)} YDT
								</div>
								<p className='text-gray-400'>课程价格</p>
							</div>

							{/* 用户余额显示 */}
							{address && !isOwnCourse && (
								<div className='mb-4 p-3 bg-gray-700 rounded-lg'>
									<div className='flex justify-between items-center'>
										<span className='text-gray-400 text-sm'>您的YDT余额</span>
										<span className='text-white font-medium'>
											{formattedBalance} YDT
										</span>
									</div>
								</div>
							)}

							{/* 购买/管理按钮 */}
							<button
								onClick={handleButtonClick}
								disabled={buttonState.disabled}
								className={buttonState.className}
							>
								{buttonState.text}
							</button>

							{/* 授权提示 */}
							{address && !isOwnCourse && !isEnrolled && needsApproval() && (
								<div className='mt-4 p-3 bg-yellow-600/20 border border-yellow-600/30 rounded-lg'>
									<p className='text-yellow-400 text-sm text-center'>
										购买前需要授权YDT代币
									</p>
								</div>
							)}

							{/* IPFS信息 */}
							{course.ipfsCid && (
								<div className='mt-4 p-3 bg-gray-700 rounded-lg'>
									<p className='text-gray-400 text-xs mb-1'>IPFS CID</p>
									<p className='text-white text-sm font-mono break-all'>
										{course.ipfsCid}
									</p>
								</div>
							)}

							{/* 课程统计 */}
							<div className='mt-6 space-y-4'>
								<div className='flex justify-between items-center py-2 border-b border-gray-700'>
									<span className='text-gray-400'>总学生数</span>
									<span className='text-white font-medium'>
										{course.totalStudents}
									</span>
								</div>

								<div className='flex justify-between items-center py-2 border-b border-gray-700'>
									<span className='text-gray-400'>课程内容</span>
									<span className='text-white font-medium'>
										{course.contentUrls?.length || 0} 个
									</span>
								</div>

								<div className='flex justify-between items-center py-2 border-b border-gray-700'>
									<span className='text-gray-400'>状态</span>
									<span
										className={`font-medium ${course.isActive ? 'text-green-400' : 'text-red-400'}`}
									>
										{course.isActive ? '活跃' : '已停用'}
									</span>
								</div>

								{course.level && (
									<div className='flex justify-between items-center py-2 border-b border-gray-700'>
										<span className='text-gray-400'>难度</span>
										<span className='text-white font-medium'>
											{course.level}
										</span>
									</div>
								)}

								{course.duration && (
									<div className='flex justify-between items-center py-2'>
										<span className='text-gray-400'>时长</span>
										<span className='text-white font-medium'>
											{course.duration}
										</span>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
