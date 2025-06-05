import React, { useState, useEffect } from 'react';
import { useCourseForm } from '../../hooks/useCourseForm';

interface CourseFormProps {
	mode?: 'create' | 'edit';
	courseId?: number;
	onSuccess?: (courseId?: number) => void;
	onCancel?: () => void;
}

export const CourseForm: React.FC<CourseFormProps> = ({
	mode = 'create',
	courseId,
	onSuccess,
	onCancel,
}) => {
	const {
		formData,
		errors,
		isLoading,
		submitSuccess,
		isCreateCourseSuccess,
		ipfsError,
		getCurrentStep,
		getStatusText,
		updateField,
		updateContentUrls,
		submitForm,
		resetForm,
		addTag,
		removeTag,
		addPrerequisite,
		removePrerequisite,
		addLearningOutcome,
		removeLearningOutcome,
	} = useCourseForm(mode, courseId);

	const [newTag, setNewTag] = useState('');
	const [newPrerequisite, setNewPrerequisite] = useState('');
	const [newLearningOutcome, setNewLearningOutcome] = useState('');
	const [hasTriggeredSuccess, setHasTriggeredSuccess] = useState(false);

	// 监听交易成功状态，只在真正成功时触发 onSuccess
	useEffect(() => {
		if (submitSuccess && !hasTriggeredSuccess) {
			console.log('课程操作成功，触发回调');
			setHasTriggeredSuccess(true);
			if (onSuccess) {
				// 延迟一下再跳转，让用户看到成功提示
				setTimeout(() => {
					onSuccess();
				}, 2000);
			}
		}
	}, [submitSuccess, hasTriggeredSuccess, onSuccess]);

	// 处理内容链接变化
	const handleContentUrlChange = (index: number, value: string) => {
		const newUrls = [...formData.contentUrls];
		newUrls[index] = value;
		updateContentUrls(newUrls);
	};

	// 添加内容链接
	const addContentUrl = () => {
		updateContentUrls([...formData.contentUrls, '']);
	};

	// 移除内容链接
	const removeContentUrl = (index: number) => {
		if (formData.contentUrls.length > 1) {
			const newUrls = formData.contentUrls.filter((_, i) => i !== index);
			updateContentUrls(newUrls);
		}
	};

	// 添加标签
	const handleAddTag = () => {
		if (newTag.trim()) {
			addTag(newTag);
			setNewTag('');
		}
	};

	// 添加前置条件
	const handleAddPrerequisite = () => {
		if (newPrerequisite.trim()) {
			addPrerequisite(newPrerequisite);
			setNewPrerequisite('');
		}
	};

	// 添加学习成果
	const handleAddLearningOutcome = () => {
		if (newLearningOutcome.trim()) {
			addLearningOutcome(newLearningOutcome);
			setNewLearningOutcome('');
		}
	};

	// 处理提交
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		console.log('提交表单...');

		// 重置成功状态
		setHasTriggeredSuccess(false);

		try {
			await submitForm();
			console.log('表单提交完成，等待交易确认...');
		} catch (error) {
			console.error('表单提交失败:', error);
		}
	};

	// 成功状态显示
	if (submitSuccess) {
		return (
			<div className='max-w-4xl mx-auto p-6'>
				<div className='bg-green-900/20 border border-green-500 rounded-2xl p-8 text-center'>
					<div className='text-green-400 text-6xl mb-4'>✅</div>
					<h2 className='text-2xl font-bold text-green-400 mb-4'>
						{mode === 'create' ? '课程创建成功！' : '课程更新成功！'}
					</h2>
					<p className='text-gray-300 mb-6'>
						您的课程已经成功{mode === 'create' ? '创建' : '更新'}
						并存储在区块链上。正在跳转到课程列表...
					</p>
					<div className='flex justify-center space-x-4'>
						<button
							onClick={() => onSuccess && onSuccess()}
							className='bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium transition-colors'
						>
							立即查看
						</button>
						<button
							onClick={resetForm}
							className='bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-colors'
						>
							创建新课程
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='max-w-4xl mx-auto p-6'>
			<div className='bg-gray-800 rounded-2xl p-8'>
				{/* 标题 */}
				<div className='mb-8'>
					<h1 className='text-3xl font-bold text-white mb-2'>
						{mode === 'create' ? '创建新课程' : '编辑课程'}
					</h1>
					<p className='text-gray-400'>
						填写下面的信息来{mode === 'create' ? '创建' : '更新'}您的课程
					</p>
				</div>

				{/* 进度显示 */}
				{isLoading && (
					<div className='mb-6 bg-blue-900/20 border border-blue-500 rounded-xl p-4'>
						<div className='flex items-center space-x-3'>
							<div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400'></div>
							<div>
								<p className='text-blue-400 font-medium'>{getStatusText()}</p>
								{getCurrentStep() === 'uploading' && (
									<p className='text-blue-300 text-sm'>
										正在将课程内容上传到IPFS去中心化网络...
									</p>
								)}
								{getCurrentStep() === 'creating' && (
									<p className='text-blue-300 text-sm'>请在钱包中确认交易...</p>
								)}
								{getCurrentStep() === 'confirming' && (
									<p className='text-blue-300 text-sm'>
										交易已提交，等待区块链网络确认...
									</p>
								)}
							</div>
						</div>
					</div>
				)}

				{/* IPFS错误显示 */}
				{ipfsError && (
					<div className='mb-6 bg-red-900/20 border border-red-500 rounded-xl p-4'>
						<p className='text-red-400'>IPFS上传失败: {ipfsError}</p>
					</div>
				)}

				<form onSubmit={handleSubmit} className='space-y-6'>
					{/* 基础信息 */}
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						{/* 课程标题 */}
						<div className='md:col-span-2'>
							<label className='block text-sm font-medium text-gray-300 mb-2'>
								课程标题 *
							</label>
							<input
								type='text'
								value={formData.title}
								onChange={(e) => updateField('title', e.target.value)}
								placeholder='输入课程标题'
								disabled={isLoading}
								className={`w-full bg-gray-700 border ${
									errors.title ? 'border-red-500' : 'border-gray-600'
								} rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
								maxLength={100}
							/>
							{errors.title && (
								<p className='text-red-400 text-sm mt-1'>{errors.title}</p>
							)}
						</div>

						{/* 分类 */}
						<div>
							<label className='block text-sm font-medium text-gray-300 mb-2'>
								课程分类
							</label>
							<select
								value={formData.category}
								onChange={(e) => updateField('category', e.target.value)}
								disabled={isLoading}
								className='w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
							>
								<option value=''>选择分类</option>
								<option value='编程开发'>编程开发</option>
								<option value='区块链'>区块链</option>
								<option value='人工智能'>人工智能</option>
								<option value='数据科学'>数据科学</option>
								<option value='设计'>设计</option>
								<option value='商业'>商业</option>
								<option value='其他'>其他</option>
							</select>
							{errors.category && (
								<p className='text-red-400 text-sm mt-1'>{errors.category}</p>
							)}
						</div>

						{/* 难度等级 */}
						<div>
							<label className='block text-sm font-medium text-gray-300 mb-2'>
								难度等级
							</label>
							<select
								value={formData.level}
								onChange={(e) => updateField('level', e.target.value)}
								disabled={isLoading}
								className='w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
							>
								<option value=''>选择难度</option>
								<option value='初级'>初级</option>
								<option value='中级'>中级</option>
								<option value='高级'>高级</option>
								<option value='专家'>专家</option>
							</select>
							{errors.level && (
								<p className='text-red-400 text-sm mt-1'>{errors.level}</p>
							)}
						</div>

						{/* 课程时长 */}
						<div>
							<label className='block text-sm font-medium text-gray-300 mb-2'>
								课程时长
							</label>
							<input
								type='text'
								value={formData.duration}
								onChange={(e) => updateField('duration', e.target.value)}
								placeholder='例如: 10小时'
								disabled={isLoading}
								className='w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
								maxLength={50}
							/>
							{errors.duration && (
								<p className='text-red-400 text-sm mt-1'>{errors.duration}</p>
							)}
						</div>

						{/* 价格 */}
						<div>
							<label className='block text-sm font-medium text-gray-300 mb-2'>
								价格 (YDT) *
							</label>
							<input
								type='number'
								step='0.001'
								min='0'
								value={formData.price}
								onChange={(e) => updateField('price', e.target.value)}
								placeholder='0.00'
								disabled={isLoading}
								className={`w-full bg-gray-700 border ${
									errors.price ? 'border-red-500' : 'border-gray-600'
								} rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
							/>
							{errors.price && (
								<p className='text-red-400 text-sm mt-1'>{errors.price}</p>
							)}
						</div>
					</div>

					{/* 课程描述 */}
					<div>
						<label className='block text-sm font-medium text-gray-300 mb-2'>
							课程描述 *
						</label>
						<textarea
							value={formData.description}
							onChange={(e) => updateField('description', e.target.value)}
							placeholder='详细描述您的课程内容、目标学员、学习收获等'
							rows={6}
							disabled={isLoading}
							className={`w-full bg-gray-700 border ${
								errors.description ? 'border-red-500' : 'border-gray-600'
							} rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
							maxLength={2000}
						/>
						<div className='flex justify-between items-center mt-1'>
							{errors.description && (
								<p className='text-red-400 text-sm'>{errors.description}</p>
							)}
							<p className='text-gray-400 text-sm'>
								{formData.description.length}/2000
							</p>
						</div>
					</div>

					{/* 封面图片 */}
					<div>
						<label className='block text-sm font-medium text-gray-300 mb-2'>
							封面图片链接 *
						</label>
						<input
							type='url'
							value={formData.imageUrl}
							onChange={(e) => updateField('imageUrl', e.target.value)}
							placeholder='https://example.com/image.jpg'
							disabled={isLoading}
							className={`w-full bg-gray-700 border ${
								errors.imageUrl ? 'border-red-500' : 'border-gray-600'
							} rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
						/>
						{errors.imageUrl && (
							<p className='text-red-400 text-sm mt-1'>{errors.imageUrl}</p>
						)}
						{formData.imageUrl && (
							<div className='mt-3'>
								<img
									src={formData.imageUrl}
									alt='课程封面预览'
									className='w-32 h-20 object-cover rounded-lg'
									onError={(e) => {
										(e.target as HTMLImageElement).style.display = 'none';
									}}
								/>
							</div>
						)}
					</div>

					{/* 课程内容链接 */}
					<div>
						<label className='block text-sm font-medium text-gray-300 mb-2'>
							课程内容链接 *
						</label>
						<div className='space-y-3'>
							{formData.contentUrls.map((url, index) => (
								<div key={index} className='flex space-x-3'>
									<input
										type='url'
										value={url}
										onChange={(e) =>
											handleContentUrlChange(index, e.target.value)
										}
										placeholder={`第${index + 1}课内容链接`}
										disabled={isLoading}
										className='flex-1 bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
									/>
									{formData.contentUrls.length > 1 && (
										<button
											type='button'
											onClick={() => removeContentUrl(index)}
											disabled={isLoading}
											className='bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:opacity-50 text-white px-4 py-3 rounded-xl transition-colors disabled:cursor-not-allowed'
										>
											删除
										</button>
									)}
								</div>
							))}
							<button
								type='button'
								onClick={addContentUrl}
								disabled={isLoading}
								className='bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 text-white px-4 py-2 rounded-xl transition-colors disabled:cursor-not-allowed'
							>
								+ 添加内容链接
							</button>
						</div>
						{errors.contentUrls && (
							<p className='text-red-400 text-sm mt-1'>{errors.contentUrls}</p>
						)}
					</div>

					{/* 标签 */}
					<div>
						<label className='block text-sm font-medium text-gray-300 mb-2'>
							课程标签
						</label>
						<div className='flex flex-wrap gap-2 mb-3'>
							{formData.tags.map((tag, index) => (
								<span
									key={index}
									className='bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2'
								>
									<span>{tag}</span>
									<button
										type='button'
										onClick={() => removeTag(index)}
										disabled={isLoading}
										className='text-white hover:text-red-300 disabled:cursor-not-allowed'
									>
										×
									</button>
								</span>
							))}
						</div>
						<div className='flex space-x-3'>
							<input
								type='text'
								value={newTag}
								onChange={(e) => setNewTag(e.target.value)}
								placeholder='输入标签'
								disabled={isLoading}
								className='flex-1 bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
								maxLength={20}
								onKeyPress={(e) =>
									e.key === 'Enter' && (e.preventDefault(), handleAddTag())
								}
							/>
							<button
								type='button'
								onClick={handleAddTag}
								disabled={isLoading}
								className='bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 text-white px-4 py-3 rounded-xl transition-colors disabled:cursor-not-allowed'
							>
								添加
							</button>
						</div>
						{errors.tags && (
							<p className='text-red-400 text-sm mt-1'>{errors.tags}</p>
						)}
					</div>

					{/* 前置条件 */}
					<div>
						<label className='block text-sm font-medium text-gray-300 mb-2'>
							前置条件
						</label>
						<div className='space-y-2 mb-3'>
							{formData.prerequisites.map((req, index) => (
								<div
									key={index}
									className='flex items-center justify-between bg-gray-700 px-4 py-2 rounded-lg'
								>
									<span className='text-white'>{req}</span>
									<button
										type='button'
										onClick={() => removePrerequisite(index)}
										disabled={isLoading}
										className='text-red-400 hover:text-red-300 disabled:cursor-not-allowed'
									>
										删除
									</button>
								</div>
							))}
						</div>
						<div className='flex space-x-3'>
							<input
								type='text'
								value={newPrerequisite}
								onChange={(e) => setNewPrerequisite(e.target.value)}
								placeholder='输入前置条件'
								disabled={isLoading}
								className='flex-1 bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
								onKeyPress={(e) =>
									e.key === 'Enter' &&
									(e.preventDefault(), handleAddPrerequisite())
								}
							/>
							<button
								type='button'
								onClick={handleAddPrerequisite}
								disabled={isLoading}
								className='bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 text-white px-4 py-3 rounded-xl transition-colors disabled:cursor-not-allowed'
							>
								添加
							</button>
						</div>
					</div>

					{/* 学习成果 */}
					<div>
						<label className='block text-sm font-medium text-gray-300 mb-2'>
							学习成果
						</label>
						<div className='space-y-2 mb-3'>
							{formData.learningOutcomes.map((outcome, index) => (
								<div
									key={index}
									className='flex items-center justify-between bg-gray-700 px-4 py-2 rounded-lg'
								>
									<span className='text-white'>{outcome}</span>
									<button
										type='button'
										onClick={() => removeLearningOutcome(index)}
										disabled={isLoading}
										className='text-red-400 hover:text-red-300 disabled:cursor-not-allowed'
									>
										删除
									</button>
								</div>
							))}
						</div>
						<div className='flex space-x-3'>
							<input
								type='text'
								value={newLearningOutcome}
								onChange={(e) => setNewLearningOutcome(e.target.value)}
								placeholder='输入学习成果'
								disabled={isLoading}
								className='flex-1 bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
								onKeyPress={(e) =>
									e.key === 'Enter' &&
									(e.preventDefault(), handleAddLearningOutcome())
								}
							/>
							<button
								type='button'
								onClick={handleAddLearningOutcome}
								disabled={isLoading}
								className='bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 text-white px-4 py-3 rounded-xl transition-colors disabled:cursor-not-allowed'
							>
								添加
							</button>
						</div>
					</div>

					{/* 提交按钮 */}
					<div className='flex justify-end space-x-4 pt-6'>
						{onCancel && (
							<button
								type='button'
								onClick={onCancel}
								disabled={isLoading}
								className='bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:cursor-not-allowed'
							>
								取消
							</button>
						)}
						<button
							type='submit'
							disabled={isLoading}
							className='bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-600 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed'
						>
							{isLoading
								? getStatusText() || '处理中...'
								: mode === 'create'
									? '创建课程'
									: '更新课程'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};
