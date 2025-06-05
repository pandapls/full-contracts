import { useState, useEffect, useCallback } from 'react';
import { CourseFormData } from '../types/Course.type';
import { useContractActions } from './useContractActions';
import { useCourseDetail } from './useCourseDetail';

// 课程表单 Hook
export const useCourseForm = (mode: 'create' | 'edit', courseId?: number) => {
	const [formData, setFormData] = useState<CourseFormData>({
		title: '',
		description: '',
		imageUrl: '',
		price: '',
		contentUrls: [''],
		category: '',
		tags: [],
		level: '',
		duration: '',
		prerequisites: [],
		learningOutcomes: [],
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitSuccess, setSubmitSuccess] = useState(false);

	const {
		createCourse,
		isCreating,
		isWaitingForCreateCourse,
		isCreateCourseSuccess,
		uploadingToIPFS,
		ipfsError,
	} = useContractActions();

	const { course } = useCourseDetail(courseId || 0);

	// 编辑模式时加载现有数据
	useEffect(() => {
		if (mode === 'edit' && course && !uploadingToIPFS) {
			setFormData({
				title: course.title || '',
				description: course.description || '',
				imageUrl: course.imageUrl || '',
				price: course.price ? (Number(course.price) / 1e18).toString() : '',
				contentUrls: course.contentUrls?.length ? course.contentUrls : [''],
				category: course.category || '',
				tags: course.tags || [],
				level: course.level || '',
				duration: course.duration || '',
				prerequisites: course.prerequisites || [],
				learningOutcomes: course.learningOutcomes || [],
			});
		}
	}, [mode, course, uploadingToIPFS]);

	// 监听交易确认状态
	useEffect(() => {
		if (isCreateCourseSuccess && mode === 'create') {
			console.log('课程创建成功，交易已确认');
			setSubmitSuccess(true);
			setIsSubmitting(false);
		}
	}, [isCreateCourseSuccess, mode]);

	// 表单验证
	const validateForm = useCallback((): boolean => {
		const newErrors: Record<string, string> = {};

		// 基础字段验证
		if (!formData.title.trim()) {
			newErrors.title = '课程标题不能为空';
		} else if (formData.title.length < 5) {
			newErrors.title = '课程标题至少需要5个字符';
		} else if (formData.title.length > 100) {
			newErrors.title = '课程标题不能超过100个字符';
		}

		if (!formData.description.trim()) {
			newErrors.description = '课程描述不能为空';
		} else if (formData.description.length < 5) {
			newErrors.description = '课程描述至少需要5个字符';
		} else if (formData.description.length > 2000) {
			newErrors.description = '课程描述不能超过2000个字符';
		}

		if (!formData.imageUrl.trim()) {
			newErrors.imageUrl = '请提供课程封面图片链接';
		} else if (
			!/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(formData.imageUrl)
		) {
			newErrors.imageUrl = '请提供有效的图片链接（jpg、png、gif、webp格式）';
		}

		if (!formData.price.trim()) {
			newErrors.price = '请设置课程价格';
		} else {
			const price = parseFloat(formData.price);
			if (isNaN(price) || price <= 0) {
				newErrors.price = '请输入有效的价格（大于0）';
			} else if (price > 10000) {
				newErrors.price = '价格不能超过10000 YDT';
			}
		}

		// 内容链接验证
		const validUrls = formData.contentUrls.filter((url) => url.trim());
		if (validUrls.length === 0) {
			newErrors.contentUrls = '至少需要添加一个课程内容链接';
		} else {
			const invalidUrls = validUrls.filter(
				(url) => !/^https?:\/\/.+/.test(url)
			);
			if (invalidUrls.length > 0) {
				newErrors.contentUrls = '请确保所有内容链接都是有效的URL';
			}
		}

		// 可选字段验证
		if (formData.category && formData.category.length > 50) {
			newErrors.category = '分类名称不能超过50个字符';
		}

		if (
			formData.level &&
			!['初级', '中级', '高级', '专家'].includes(formData.level)
		) {
			newErrors.level = '请选择有效的难度等级';
		}

		if (formData.duration && formData.duration.length > 50) {
			newErrors.duration = '课程时长描述不能超过50个字符';
		}

		// 标签验证
		if (formData.tags.length > 10) {
			newErrors.tags = '标签数量不能超过10个';
		}
		const invalidTags = formData.tags.filter((tag) => tag.length > 20);
		if (invalidTags.length > 0) {
			newErrors.tags = '每个标签长度不能超过20个字符';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	}, [formData]);

	// 更新单个字段
	const updateField = useCallback(
		(field: keyof CourseFormData, value: string | string[]) => {
			setFormData((prev) => ({ ...prev, [field]: value }));
			// 清除该字段的错误
			if (errors[field]) {
				setErrors((prev) => ({ ...prev, [field]: '' }));
			}
		},
		[errors]
	);

	// 更新内容链接
	const updateContentUrls = useCallback(
		(urls: string[]) => {
			setFormData((prev) => ({ ...prev, contentUrls: urls }));
			if (errors.contentUrls) {
				setErrors((prev) => ({ ...prev, contentUrls: '' }));
			}
		},
		[errors]
	);

	// 添加标签
	const addTag = useCallback(
		(tag: string) => {
			if (tag.trim() && !formData.tags.includes(tag.trim())) {
				const newTags = [...formData.tags, tag.trim()];
				updateField('tags', newTags);
			}
		},
		[formData.tags, updateField]
	);

	// 移除标签
	const removeTag = useCallback(
		(index: number) => {
			const newTags = formData.tags.filter((_, i) => i !== index);
			updateField('tags', newTags);
		},
		[formData.tags, updateField]
	);

	// 添加前置条件
	const addPrerequisite = useCallback(
		(prerequisite: string) => {
			if (
				prerequisite.trim() &&
				!formData.prerequisites.includes(prerequisite.trim())
			) {
				const newPrerequisites = [
					...formData.prerequisites,
					prerequisite.trim(),
				];
				updateField('prerequisites', newPrerequisites);
			}
		},
		[formData.prerequisites, updateField]
	);

	// 移除前置条件
	const removePrerequisite = useCallback(
		(index: number) => {
			const newPrerequisites = formData.prerequisites.filter(
				(_, i) => i !== index
			);
			updateField('prerequisites', newPrerequisites);
		},
		[formData.prerequisites, updateField]
	);

	// 添加学习成果
	const addLearningOutcome = useCallback(
		(outcome: string) => {
			if (
				outcome.trim() &&
				!formData.learningOutcomes.includes(outcome.trim())
			) {
				const newOutcomes = [...formData.learningOutcomes, outcome.trim()];
				updateField('learningOutcomes', newOutcomes);
			}
		},
		[formData.learningOutcomes, updateField]
	);

	// 移除学习成果
	const removeLearningOutcome = useCallback(
		(index: number) => {
			const newOutcomes = formData.learningOutcomes.filter(
				(_, i) => i !== index
			);
			updateField('learningOutcomes', newOutcomes);
		},
		[formData.learningOutcomes, updateField]
	);

	// 提交表单
	const submitForm = useCallback(async () => {
		if (!validateForm()) {
			return false;
		}

		setIsSubmitting(true);
		setSubmitSuccess(false);

		try {
			// 清理数据
			const cleanFormData: CourseFormData = {
				...formData,
				contentUrls: formData.contentUrls.filter((url) => url.trim()),
				tags: formData.tags.filter((tag) => tag.trim()),
				prerequisites: formData.prerequisites.filter((req) => req.trim()),
				learningOutcomes: formData.learningOutcomes.filter((outcome) =>
					outcome.trim()
				),
			};
			if (mode === 'create') {
				console.log('开始创建课程...');
				// 调用创建课程，但不等待交易确认（在 useEffect 中监听确认状态）
				await createCourse(cleanFormData);
				console.log('课程创建交易已提交，等待区块链确认...');

				// 不在这里设置 submitSuccess，等待交易确认后在 useEffect 中设置
				return true;
			} else {
				// 编辑模式的逻辑（待实现）
				console.log('更新课程:', cleanFormData);
				setSubmitSuccess(true);
				setIsSubmitting(false);
				return true;
			}
		} catch (error) {
			console.error('表单提交失败:', error);
			setIsSubmitting(false);
			return false;
		}
	}, [formData, mode, createCourse, validateForm]);

	// 重置表单
	const resetForm = useCallback(() => {
		setFormData({
			title: '',
			description: '',
			imageUrl: '',
			price: '',
			contentUrls: [''],
			category: '',
			tags: [],
			level: '',
			duration: '',
			prerequisites: [],
			learningOutcomes: [],
		});
		setErrors({});
		setSubmitSuccess(false);
		setIsSubmitting(false);
	}, []);

	// 当前状态
	const isLoading =
		isSubmitting || isCreating || uploadingToIPFS || isWaitingForCreateCourse;

	// 获取当前步骤状态
	const getCurrentStep = useCallback(() => {
		if (uploadingToIPFS) return 'uploading';
		if (isCreating) return 'creating';
		if (isWaitingForCreateCourse) return 'confirming';
		if (isSubmitting) return 'submitting';
		return 'idle';
	}, [uploadingToIPFS, isCreating, isWaitingForCreateCourse, isSubmitting]);

	// 获取状态文本
	const getStatusText = useCallback(() => {
		switch (getCurrentStep()) {
			case 'uploading':
				return '正在上传课程内容到IPFS...';
			case 'creating':
				return '正在提交创建课程交易...';
			case 'confirming':
				return '等待区块链确认交易...';
			case 'submitting':
				return '正在提交...';
			default:
				return '';
		}
	}, [getCurrentStep]);

	return {
		// 表单数据和状态
		formData,
		errors,
		isLoading,
		submitSuccess,

		// 详细状态
		isSubmitting,
		uploadingToIPFS,
		isCreating,
		isWaitingForCreateCourse,
		isCreateCourseSuccess,
		ipfsError,

		// 状态工具
		getCurrentStep,
		getStatusText,

		// 基础操作
		updateField,
		updateContentUrls,
		validateForm,
		submitForm,
		resetForm,

		// 数组字段操作
		addTag,
		removeTag,
		addPrerequisite,
		removePrerequisite,
		addLearningOutcome,
		removeLearningOutcome,
	};
};
