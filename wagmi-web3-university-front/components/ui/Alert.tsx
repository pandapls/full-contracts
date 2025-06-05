import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react";

interface AlertProps {
	type?: 'info' | 'success' | 'warning' | 'error';
	title?: string;
	children: React.ReactNode;
	onClose?: () => void;
	className?: string;
}

export const Alert: React.FC<AlertProps> = ({
	type = 'info',
	title,
	children,
	onClose,
	className = '',
}) => {
	const config = {
		info: {
			icon: <Info size={20} />,
			bgColor: 'bg-blue-50',
			borderColor: 'border-blue-200',
			iconColor: 'text-blue-600',
			textColor: 'text-blue-800',
		},
		success: {
			icon: <CheckCircle size={20} />,
			bgColor: 'bg-green-50',
			borderColor: 'border-green-200',
			iconColor: 'text-green-600',
			textColor: 'text-green-800',
		},
		warning: {
			icon: <AlertTriangle size={20} />,
			bgColor: 'bg-yellow-50',
			borderColor: 'border-yellow-200',
			iconColor: 'text-yellow-600',
			textColor: 'text-yellow-800',
		},
		error: {
			icon: <AlertCircle size={20} />,
			bgColor: 'bg-red-50',
			borderColor: 'border-red-200',
			iconColor: 'text-red-600',
			textColor: 'text-red-800',
		},
	};

	const alertConfig = config[type];

	return (
		<div
			className={`
      ${alertConfig.bgColor} 
      ${alertConfig.borderColor} 
      border rounded-lg p-4 
      ${className}
    `}
		>
			<div className='flex'>
				<div className={`flex-shrink-0 ${alertConfig.iconColor}`}>
					{alertConfig.icon}
				</div>
				<div className='ml-3 flex-1'>
					{title && (
						<h3 className={`text-sm font-medium ${alertConfig.textColor} mb-1`}>
							{title}
						</h3>
					)}
					<div className={`text-sm ${alertConfig.textColor}`}>{children}</div>
				</div>
				{onClose && (
					<div className='ml-auto pl-3'>
						<button
							onClick={onClose}
							className={`
                inline-flex rounded-md p-1.5 ${alertConfig.textColor} 
                hover:bg-white hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2
              `}
						>
							<X size={16} />
						</button>
					</div>
				)}
			</div>
		</div>
	);
};
