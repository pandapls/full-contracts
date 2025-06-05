'use client'
import React from 'react';
import { useAccount } from 'wagmi';
import { useTokenBalance } from '../../../hooks/useTokenBalance';
import { CourseList } from '../../../components/Course/CourseList';

 const Page: React.FC = () => {
	const { address, isConnected } = useAccount();
	const { formattedBalance } = useTokenBalance(address);

	return (
		<div className='min-h-screen'>
			{/* 课程列表 */}
			<div>
				<div className='container mx-auto px-6 pt-10'>
					<div className='relative container mx-auto px-6 text-center'>
						{isConnected ? (
							<div className='flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6'>
								<div className='flex space-x-4'>
									<button
										onClick={() => (window.location.href = '/courses/create')}
										className='bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 rounded-xl font-medium text-lg transition-all duration-200 transform hover:scale-105 cursor-pointer'
									>
										创建课程
									</button>

									<button
										onClick={() => (window.location.href = '/')}
										className='bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white px-8 py-4 rounded-xl font-medium text-lg transition-colors cursor-pointer'
									>
										购买代币
									</button>
								</div>
							</div>
						) : (
							<div className='text-center'>
								<p className='text-gray-400 mb-6'>请连接钱包开始您的学习之旅</p>
								<div className='bg-gray-800/50 border border-gray-700 rounded-2xl p-8 max-w-md mx-auto'>
									<div className='text-4xl mb-4'>🔗</div>
									<h3 className='text-xl font-bold text-white mb-2'>
										连接钱包
									</h3>
									<p className='text-gray-400 text-sm'>
										连接您的钱包以创建课程、购买内容和管理您的学习进度
									</p>
								</div>
							</div>
						)}
					</div>
				</div>

				<CourseList limit={6} showPagination={false} />

				<div className='text-center py-12'>
					<button
						onClick={() => (window.location.href = '/courses')}
						className='hover:bg-gray-700 border border-gray-600 px-8 py-4 rounded-xl font-medium text-lg transition-colors'
					>
						查看所有课程
					</button>
				</div>
			</div>
		</div>
	);
};
export default Page;