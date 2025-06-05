import { Loader2 } from "lucide-react";

interface LoadingProps {
	size?: 'sm' | 'md' | 'lg';
	text?: string;
	overlay?: boolean;
	className?: string;
}

export const Loading: React.FC<LoadingProps> = ({
	size = 'md',
	text,
	overlay = false,
	className = '',
}) => {
	const iconSizes = {
		sm: 16,
		md: 24,
		lg: 32,
	};

	const content = (
		<div className={`flex flex-col items-center ${className}`}>
			<Loader2 size={iconSizes[size]} className='animate-spin text-blue-600' />
			{text && <p className='mt-2 text-sm text-gray-600'>{text}</p>}
		</div>
	);

	if (overlay) {
		return (
			<div className='fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50'>
				{content}
			</div>
		);
	}

	return content;
};
