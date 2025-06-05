import { Badge } from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export const CourseProgressCard: React.FC<{
	course: any;
	progress: number;
	onContinue: () => void;
}> = ({ course, progress, onContinue }) => {
	const getStatusBadge = () => {
		if (progress === 0) return <Badge>未开始</Badge>;
		if (progress === 100) return <Badge>已完成</Badge>;
		return <Badge>学习中</Badge>;
	};

	return (
		<Card className='overflow-hidden hover:shadow-md transition-shadow'>
			<img
				src={course.imageUrl || '/api/placeholder/300/200'}
				alt={course.title}
				className='w-full h-40 object-cover'
			/>
			<div className='p-4'>
				<div className='flex items-start justify-between mb-2'>
					<h3 className='font-semibold text-gray-900 line-clamp-2'>
						{course.title}
					</h3>
					{getStatusBadge()}
				</div>

				<div className='mb-4'>
					<div className='flex justify-between text-sm text-gray-600 mb-1'>
						<span>学习进度</span>
						<span>{progress}%</span>
					</div>
					<div className='w-full bg-gray-200 rounded-full h-2'>
						<div
							className='bg-blue-600 h-2 rounded-full transition-all duration-300'
							style={{ width: `${progress}%` }}
						/>
					</div>
				</div>

				<Button
					onClick={onContinue}
					fullWidth
					variant={progress === 100 ? 'outline' : 'primary'}
				>
					{progress === 0
						? '开始学习'
						: progress === 100
							? '复习课程'
							: '继续学习'}
				</Button>
			</div>
		</Card>
	);
};
