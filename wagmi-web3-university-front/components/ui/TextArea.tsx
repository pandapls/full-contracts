import { AlertCircle } from "lucide-react";
import { forwardRef } from "react";

interface TextAreaProps
	extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	label?: string;
	error?: string;
	helper?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
	({ label, error, helper, className = '', ...props }, ref) => {
		return (
			<div className='space-y-1'>
				{label && (
					<label className='block text-sm font-medium text-gray-700'>
						{label}
						{props.required && <span className='text-red-500 ml-1'>*</span>}
					</label>
				)}

				<textarea
					ref={ref}
					className={`
          block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm
          ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
					{...props}
				/>

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

TextArea.displayName = 'TextArea';
