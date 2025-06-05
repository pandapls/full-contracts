import React, { useState, useEffect, forwardRef } from 'react';
import {
	X,
	AlertCircle,
	CheckCircle,
	Info,
	AlertTriangle,
	Loader2,
} from 'lucide-react';

// Button 组件
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
	size?: 'sm' | 'md' | 'lg';
	loading?: boolean;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			variant = 'primary',
			size = 'md',
			loading = false,
			leftIcon,
			rightIcon,
			fullWidth = false,
			children,
			disabled,
			className = '',
			...props
		},
		ref
	) => {
		const baseClasses =
			'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

		const variantClasses = {
			primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
			secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
			danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
			outline:
				'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500',
			ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
		};

		const sizeClasses = {
			sm: 'px-3 py-1.5 text-sm',
			md: 'px-4 py-2',
			lg: 'px-6 py-3 text-lg',
		};

		const iconSize = size === 'sm' ? 16 : size === 'lg' ? 20 : 18;

		return (
			<button
				ref={ref}
				disabled={disabled || loading}
				className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
				{...props}
			>
				{loading && <Loader2 size={iconSize} className='animate-spin mr-2' />}
				{!loading && leftIcon && <span className='mr-2'>{leftIcon}</span>}
				{children}
				{!loading && rightIcon && <span className='ml-2'>{rightIcon}</span>}
			</button>
		);
	}
);

Button.displayName = 'Button';
