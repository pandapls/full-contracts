import { AlertCircle } from "lucide-react";
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
	helper?: string;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
	(
		{ label, error, helper, leftIcon, rightIcon, className = '', ...props },
		ref
	) => {
		return (
			<div className='space-y-1'>
				{label && (
					<label className='block text-sm font-medium text-gray-700'>
						{label}
						{props.required && <span className='text-red-500 ml-1'>*</span>}
					</label>
				)}

				<div className='relative'>
					{leftIcon && (
						<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
							<span className='text-gray-400'>{leftIcon}</span>
						</div>
					)}

					<input
						ref={ref}
						className={`
            block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm
            ${leftIcon ? 'pl-10' : 'pl-3'}
            ${rightIcon ? 'pr-10' : 'pr-3'}
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
						{...props}
					/>

					{rightIcon && (
						<div className='absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none'>
							<span className='text-gray-400'>{rightIcon}</span>
						</div>
					)}
				</div>

				{error && (
					<p className='text-sm text-red-600 flex items-center gap-1'>
						<AlertCircle size={14} />
						{error}
					</p>
				)}

				{helper && !error && <p className='text-sm text-gray-600'>{helper}</p>}
			</div>
		);
	}
);

Input.displayName = 'Input';
