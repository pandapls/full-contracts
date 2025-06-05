// Card 组件
interface CardProps {
	children: React.ReactNode;
	className?: string;
	hover?: boolean;
	padding?: 'none' | 'sm' | 'md' | 'lg';
	onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
	children,
	className = '',
	hover = false,
	padding = 'md',
	onClick,
}) => {
	const paddingClasses = {
		none: '',
		sm: 'p-4',
		md: 'p-6',
		lg: 'p-8',
	};

	return (
		<div
			className={`
        bg-white rounded-lg shadow-sm border border-gray-200
        ${hover ? 'hover:shadow-md transition-shadow duration-200' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${paddingClasses[padding]}
        ${className}
      `}
			onClick={onClick}
		>
			{children}
		</div>
	);
};
