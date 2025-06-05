import { Button } from "./Button";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	showTotal?: boolean;
	totalItems?: number;
	className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
	currentPage,
	totalPages,
	onPageChange,
	showTotal = false,
	totalItems,
	className = '',
}) => {
	const getVisiblePages = () => {
		const maxVisible = 5;
		const pages: (number | string)[] = [];

		if (totalPages <= maxVisible) {
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			const start = Math.max(1, currentPage - 2);
			const end = Math.min(totalPages, start + maxVisible - 1);

			if (start > 1) {
				pages.push(1);
				if (start > 2) pages.push('...');
			}

			for (let i = start; i <= end; i++) {
				pages.push(i);
			}

			if (end < totalPages) {
				if (end < totalPages - 1) pages.push('...');
				pages.push(totalPages);
			}
		}

		return pages;
	};

	return (
		<div className={`flex items-center justify-between ${className}`}>
			{showTotal && totalItems && (
				<div className='text-sm text-gray-700'>
					共 <span className='font-medium'>{totalItems}</span> 项
				</div>
			)}

			<div className='flex items-center space-x-2'>
				<Button
					variant='outline'
					size='sm'
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage <= 1}
				>
					上一页
				</Button>

				{getVisiblePages().map((page, index) => (
					<button
						key={index}
						onClick={() => typeof page === 'number' && onPageChange(page)}
						disabled={page === '...'}
						className={`
              px-3 py-2 text-sm rounded-lg transition-colors
              ${
								page === currentPage
									? 'bg-blue-600 text-white'
									: page === '...'
										? 'text-gray-400 cursor-default'
										: 'text-gray-700 hover:bg-gray-100'
							}
            `}
					>
						{page}
					</button>
				))}

				<Button
					variant='outline'
					size='sm'
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage >= totalPages}
				>
					下一页
				</Button>
			</div>
		</div>
	);
};
