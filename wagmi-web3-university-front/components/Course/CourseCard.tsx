import { useState, useEffect } from 'react';
import { Address, formatEther } from 'viem';
import { Course } from '../../types/Course.type';
import { useContractActions } from '../../hooks/useContractActions';
import { useTokenBalance } from '../../hooks/useTokenBalance';

interface CourseCardProps {
	course: Course;
	isEnrolled?: boolean;
	onEnroll?: () => void;
	userAddress?: Address;
	isPurchasing?: boolean;
	onCardClick?: (courseId: number) => void;
	onManageCourse?: (courseId: number) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
	course,
	isEnrolled = false,
	onEnroll,
	userAddress,
	onCardClick,
	onManageCourse,
}) => {
	const [showToast, setShowToast] = useState<{
		message: string;
		type: 'success' | 'error' | 'info';
	} | null>(null);
	const [purchaseStep, setPurchaseStep] = useState<
		'idle' | 'approving' | 'purchasing' | 'completed'
	>('idle');

	const { formattedBalance } = useTokenBalance(userAddress);

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

	// 判断是否是自己的课程
	const isOwnCourse =
		userAddress?.toLowerCase() === course.instructor.toLowerCase();

	// 检查是否需要授权
	const needsApproval = () => {
		if (!allowance) return true;
		return allowance < course.price;
	};

	// 检查YDT余额是否足够
	const hasEnoughBalance = () => {
		if (!ydtBalance) return false;
		return ydtBalance >= course.price;
	};

	// Toast显示函数
	const displayToast = (
		message: string,
		type: 'success' | 'error' | 'info' = 'info'
	) => {
		setShowToast({ message, type });
		setTimeout(() => setShowToast(null), 4000);
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
			displayToast('购买成功！', 'success');
			setPurchaseStep('completed');
			onEnroll?.();
		}
	}, [isPurchaseSuccess, purchaseStep, onEnroll]);

	// 实际的购买逻辑
	const handlePurchaseCourse = async () => {
		try {
			await purchaseCourse(course.id);
		} catch (error) {
			console.error('Purchase failed:', error);
			displayToast('购买失败，请重试', 'error');
			setPurchaseStep('idle');
		}
	};

	// 主购买函数
	const handlePurchase = async (e: React.MouseEvent) => {
		e.stopPropagation(); // 阻止事件冒泡

		if (!userAddress) {
			displayToast('请先连接钱包', 'error');
			return;
		}

		if (isOwnCourse) {
			displayToast('不能购买自己的课程', 'error');
			return;
		}

		if (!hasEnoughBalance()) {
			displayToast(
				`YDT余额不足，需要 ${formatEther(course.price)} YDT`,
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
			}

			displayToast(errorMessage, 'error');
			setPurchaseStep('idle');
		}
	};

	// 处理卡片点击
	const handleCardClick = () => {
		if (onCardClick) {
			onCardClick(course.id);
		} else {
			window.location.href = `/courses/${course.id}`;
		}
	};

	// 处理管理课程点击
	const handleManageCourse = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (onManageCourse) {
			onManageCourse(course.id);
		} else {
			window.location.href = `/manage-course/${course.id}`;
		}
	};

	// 处理按钮点击
	const handleButtonClick = (e: React.MouseEvent) => {
		e.stopPropagation();

		if (isOwnCourse) {
			handleManageCourse(e);
		} else if (isEnrolled) {
			handleCardClick();
		} else {
			handlePurchase(e);
		}
	};

	const formatAddress = (address: string) => {
		return `${address.slice(0, 6)}...${address.slice(-4)}`;
	};

	const formatDate = (timestamp: number) => {
		return new Date(timestamp * 1000).toLocaleDateString('zh-CN');
	};

	// 获取按钮文本和样式
	const getButtonConfig = () => {
		if (isOwnCourse) {
			return {
				text: '管理课程',
				className:
					'w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-xl font-medium transition-all duration-200',
				disabled: false,
			};
		}

		if (isEnrolled) {
			return {
				text: '查看课程',
				className:
					'w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-all duration-200',
				disabled: false,
			};
		}

		if (!userAddress) {
			return {
				text: '请先连接钱包',
				className:
					'w-full bg-gray-600 text-white py-3 rounded-xl font-medium cursor-not-allowed',
				disabled: true,
			};
		}

		if (!hasEnoughBalance()) {
			return {
				text: `余额不足 (${formatEther(course.price)} YDT)`,
				className:
					'w-full bg-red-600 text-white py-3 rounded-xl font-medium cursor-not-allowed',
				disabled: true,
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
				className:
					'w-full bg-blue-400 text-white py-3 rounded-xl font-medium cursor-not-allowed',
				disabled: true,
			};
		}

		return {
			text: `购买 ${formatEther(course.price)} YDT`,
			className:
				'w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 rounded-xl font-medium transition-all duration-200',
			disabled: false,
		};
	};

	const buttonConfig = getButtonConfig();

	return (
		<>
			{/* Toast notification */}
			{showToast && (
				<div
					className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border flex items-center space-x-3 min-w-80 animate-in slide-in-from-right ${
						showToast.type === 'success'
							? 'bg-green-500 text-white border-green-600'
							: showToast.type === 'error'
								? 'bg-red-500 text-white border-red-600'
								: 'bg-blue-500 text-white border-blue-600'
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

			<div
				className='bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer'
				onClick={handleCardClick}
			>
				{/* 课程封面 */}
				<div className='relative h-48 overflow-hidden'>
					<img
						src={
							course.imageUrl ||
							'https://via.placeholder.com/400x200/374151/9CA3AF?text=Course+Image'
						}
						alt={course.title}
						className='w-full h-full object-cover'
						onError={(e) => {
							const target = e.target as HTMLImageElement;
							target.src =
								'https://via.placeholder.com/400x200/374151/9CA3AF?text=Course+Image';
						}}
					/>
					<div className='absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1'>
						<span className='text-white text-sm font-medium'>
							{formatEther(course.price)} YDT
						</span>
					</div>

					{/* 状态标签 */}
					{isOwnCourse && (
						<div className='absolute top-4 left-4 bg-green-500 rounded-lg px-3 py-1'>
							<span className='text-white text-sm font-medium'>我的课程</span>
						</div>
					)}
					{!isOwnCourse && isEnrolled && (
						<div className='absolute top-4 left-4 bg-blue-500 rounded-lg px-3 py-1'>
							<span className='text-white text-sm font-medium'>已购买</span>
						</div>
					)}
					{course.ipfsCid && (
						<div className='absolute bottom-4 right-4 bg-purple-500/80 rounded-lg px-2 py-1'>
							<span className='text-white text-xs font-medium'>IPFS</span>
						</div>
					)}
				</div>

				{/* 课程信息 */}
				<div className='p-6'>
					<h3 className='text-xl font-bold text-white mb-2 line-clamp-2'>
						{course.title}
					</h3>

					<p className='text-gray-400 text-sm mb-4 line-clamp-3'>
						{course.description}
					</p>

					{/* 标签显示 */}
					{course.tags && course.tags.length > 0 && (
						<div className='flex flex-wrap gap-1 mb-4'>
							{course.tags.slice(0, 3).map((tag, index) => (
								<span
									key={index}
									className='bg-blue-600/20 text-blue-400 text-xs px-2 py-1 rounded-full'
								>
									{tag}
								</span>
							))}
							{course.tags.length > 3 && (
								<span className='text-gray-400 text-xs px-2 py-1'>
									+{course.tags.length - 3}
								</span>
							)}
						</div>
					)}

					{/* 讲师信息 */}
					<div className='flex items-center justify-between mb-4'>
						<div className='flex items-center space-x-2'>
							<div className='w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center'>
								<span className='text-white text-xs font-bold'>
									{course.instructor.slice(2, 4).toUpperCase()}
								</span>
							</div>
							<div>
								<p className='text-gray-400 text-xs'>
									{isOwnCourse ? '我' : '讲师'}
								</p>
								<p className='text-white text-sm font-medium'>
									{isOwnCourse ? '我' : formatAddress(course.instructor)}
								</p>
							</div>
						</div>

						<div className='text-right'>
							<p className='text-gray-400 text-xs'>学生数</p>
							<p className='text-white text-sm font-medium'>
								{course.totalStudents}
							</p>
						</div>
					</div>

					{/* 余额提示（仅在未购买且有钱包连接时显示） */}
					{userAddress && !isOwnCourse && !isEnrolled && (
						<div className='mb-4 p-2 bg-gray-700 rounded-lg'>
							<div className='flex justify-between items-center text-xs'>
								<span className='text-gray-400'>您的余额</span>
								<span
									className={`font-medium ${
										hasEnoughBalance() ? 'text-green-400' : 'text-red-400'
									}`}
								>
									{formattedBalance} YDT
								</span>
							</div>
						</div>
					)}

					{/* 课程统计 */}
					<div className='flex items-center justify-between mb-6 text-xs text-gray-400'>
						<span>创建于 {formatDate(course.createdAt)}</span>
						<div className='flex items-center space-x-4'>
							{course.level && (
								<span className='bg-gray-700 px-2 py-1 rounded text-xs'>
									{course.level}
								</span>
							)}
							<span>
								{(course.contentUrls && course.contentUrls.length) || 0} 个内容
							</span>
						</div>
					</div>

					{/* 按钮 */}
					<button
						onClick={handleButtonClick}
						disabled={buttonConfig.disabled}
						className={buttonConfig.className}
					>
						{buttonConfig.text}
					</button>

					{/* 授权提示 */}
					{userAddress &&
						!isOwnCourse &&
						!isEnrolled &&
						needsApproval() &&
						hasEnoughBalance() && (
							<div className='mt-2 p-2 bg-yellow-600/20 border border-yellow-600/30 rounded-lg'>
								<p className='text-yellow-400 text-xs text-center'>
									购买前需要授权YDT代币
								</p>
							</div>
						)}
				</div>
			</div>
		</>
	);
};
