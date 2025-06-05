import { BookOpen, Users, DollarSign, TrendingUp, Badge } from "lucide-react";
import { useRouter } from "next/router";
import { formatEther } from "viem";
import { Button } from "../../../../components/ui/Button";
import { Card } from "../../../../components/ui/Card";

const InstructorDashboard: React.FC<{
	courses: any[];
	totalBalance: string;
}> = ({ courses, totalBalance }) => {
	const router = useRouter();

	// 计算统计数据
	const totalStudents = courses.reduce(
		(sum, course) => sum + course.totalStudents,
		0
	);
	const totalRevenue = courses.reduce((sum, course) => {
		return sum + course.totalStudents * parseFloat(formatEther(course.price));
	}, 0);
	const activeCourses = courses.filter((course) => course.isActive).length;

	// 最近课程
	const recentCourses = courses
		.sort((a, b) => b.createdAt - a.createdAt)
		.slice(0, 3);

	return (
		<div className='space-y-8'>
			{/* Stats Grid */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
				<Card className='p-6'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-sm font-medium text-gray-600'>课程总数</p>
							<p className='text-2xl font-bold text-gray-900'>
								{courses.length}
							</p>
							<p className='text-xs text-green-600 mt-1'>+2 本月</p>
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
							<p className='text-xs text-green-600 mt-1'>+12 本月</p>
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
							<p className='text-xs text-green-600 mt-1'>+15% 本月</p>
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
							<p className='text-xs text-gray-500 mt-1'>
								{activeCourses}/{courses.length} 活跃
							</p>
						</div>
						<div className='p-3 bg-orange-100 rounded-lg'>
							<TrendingUp size={24} className='text-orange-600' />
						</div>
					</div>
				</Card>
			</div>

			{/* Recent Courses */}
			<Card>
				<div className='p-6 border-b border-gray-200'>
					<div className='flex items-center justify-between'>
						<h2 className='text-lg font-semibold text-gray-900'>最新课程</h2>
						<Button
							variant='outline'
							onClick={() => router.push('/courses/my-courses')}
						>
							查看全部
						</Button>
					</div>
				</div>
				<div className='p-6'>
					{recentCourses.length === 0 ? (
						<div className='text-center py-8'>
							<BookOpen size={48} className='mx-auto text-gray-400 mb-4' />
							<p className='text-gray-600'>还没有创建课程</p>
							<Button
								onClick={() => router.push('/courses/create')}
								className='mt-4'
							>
								创建第一个课程
							</Button>
						</div>
					) : (
						<div className='space-y-4'>
							{recentCourses.map((course) => (
								<div
									key={course.id}
									className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'
								>
									<div className='flex items-center gap-4'>
										<img
											src={course.imageUrl || '/api/placeholder/80/60'}
											alt={course.title}
											className='w-16 h-12 object-cover rounded'
										/>
										<div>
											<h3 className='font-medium text-gray-900'>
												{course.title}
											</h3>
											<div className='flex items-center gap-4 text-sm text-gray-600'>
												<span>{course.totalStudents} 学生</span>
												<span>{formatEther(course.price)} YDT</span>
												{course.isActive ? (
													<Badge>活跃</Badge>
												) : (
													<Badge>已暂停</Badge>
												)}
											</div>
										</div>
									</div>
									<Button
										variant='outline'
										size='sm'
										onClick={() => router.push(`/courses/${course.id}`)}
									>
										查看
									</Button>
								</div>
							))}
						</div>
					)}
				</div>
			</Card>
		</div>
	);
};
