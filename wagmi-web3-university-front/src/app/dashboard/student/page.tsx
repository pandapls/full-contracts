import { BookOpen, Play, CheckCircle } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";
import { Button } from "../../../../components/ui/Button";
import { Card } from "../../../../components/ui/Card";

const StudentDashboard: React.FC<{
	enrolledCourseIds: number[];
	allCourses: any[];
}> = ({ enrolledCourseIds, allCourses }) => {
	const router = useRouter();

	// 模拟学习进度数据
	const [learningProgress] = useState<Record<number, number>>({
		1: 75,
		2: 100,
		3: 25,
	});

	const enrolledCourses = allCourses.filter((course) =>
		enrolledCourseIds.includes(course.id)
	);

	const inProgress = enrolledCourses.filter((course) => {
		const progress = learningProgress[course.id] || 0;
		return progress > 0 && progress < 100;
	});

	const completed = enrolledCourses.filter((course) => {
		const progress = learningProgress[course.id] || 0;
		return progress >= 100;
	});

	return (
		<div className='space-y-8'>
			{/* Stats Grid */}
			<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
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
								{inProgress.length}
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
								{completed.length}
							</p>
						</div>
						<CheckCircle size={24} className='text-green-600' />
					</div>
				</Card>
			</div>

			{/* Continue Learning */}
			{inProgress.length > 0 && (
				<Card>
					<div className='p-6 border-b border-gray-200'>
						<div className='flex items-center justify-between'>
							<h2 className='text-lg font-semibold text-gray-900'>继续学习</h2>
							<Button
								variant='outline'
								onClick={() => router.push('/courses/my-learning')}
							>
								查看全部
							</Button>
						</div>
					</div>
					<div className='p-6'>
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
							{inProgress.slice(0, 3).map((course) => (
								<div key={course.id} className='bg-gray-50 rounded-lg p-4'>
									<img
										src={course.imageUrl || '/api/placeholder/300/180'}
										alt={course.title}
										className='w-full h-32 object-cover rounded mb-3'
									/>
									<h3 className='font-medium text-gray-900 mb-2'>
										{course.title}
									</h3>
									<div className='mb-3'>
										<div className='flex justify-between text-sm text-gray-600 mb-1'>
											<span>进度</span>
											<span>{learningProgress[course.id] || 0}%</span>
										</div>
										<div className='w-full bg-gray-200 rounded-full h-2'>
											<div
												className='bg-blue-600 h-2 rounded-full'
												style={{
													width: `${learningProgress[course.id] || 0}%`,
												}}
											/>
										</div>
									</div>
									<Button
										size='sm'
										fullWidth
										onClick={() => router.push(`/courses/${course.id}/learn`)}
									>
										继续学习
									</Button>
								</div>
							))}
						</div>
					</div>
				</Card>
			)}

			{/* Recommended Courses */}
			<Card>
				<div className='p-6 border-b border-gray-200'>
					<h2 className='text-lg font-semibold text-gray-900'>推荐课程</h2>
				</div>
				<div className='p-6'>
					<div className='text-center py-8'>
						<BookOpen size={48} className='mx-auto text-gray-400 mb-4' />
						<p className='text-gray-600 mb-4'>发现更多优质课程</p>
						<Button onClick={() => router.push('/courses')}>
							浏览课程市场
						</Button>
					</div>
				</div>
			</Card>
		</div>
	);
};
