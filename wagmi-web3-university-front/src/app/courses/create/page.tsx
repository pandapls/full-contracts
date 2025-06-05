'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { ArrowLeft } from 'lucide-react';
import { CourseForm } from '../../../../components/Course/CourseForm';
import { Button } from '../../../../components/ui/Button';

export default function CreateCoursePage() {
	const router = useRouter();
	const { isConnected } = useAccount();
	const handleCancel = () => {
		router.back();
	};

	if (!isConnected) {
		return (
			<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
				<div className='bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center'>
					<h2 className='text-2xl font-bold text-gray-900 mb-4'>
						连接钱包创建课程
					</h2>
					<p className='text-gray-600 mb-6'>您需要连接钱包才能创建课程</p>
					<Button onClick={() => window.location.reload()} className='w-full'>
						刷新页面
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen'>
			<div className='container mx-auto px-4 py-8'>
				{/* Header */}
				<div className='mb-8'>
					<Button
						variant='ghost'
						onClick={handleCancel}
						leftIcon={<ArrowLeft size={20} />}
						className='mb-4'
					>
						返回
					</Button>
				</div>

				{/* Course Form */}
				<CourseForm
					mode='create'
					onSuccess={() => router.push('/courses')}
					onCancel={() => router.back()}
				/>
			</div>
		</div>
	);
}
