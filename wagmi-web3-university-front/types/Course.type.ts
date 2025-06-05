// Course.type.ts - 最终版本，支持IPFS和所有新功能

// 链上存储的课程基本信息（对应新合约结构）
export interface CourseOnChain {
	id: number;
	ipfsCid: string;
	price: bigint;
	instructor: string;
	isActive: boolean;
	createdAt: number;
	totalStudents: number;
}

// IPFS 存储的课程详细信息
export interface CourseIPFSData {
	title: string;
	description: string;
	imageUrl: string;
	contentUrls: string[];
	category?: string;
	tags?: string[];
	level?: string; // '初级' | '中级' | '高级' | '专家'
	duration?: string;
	prerequisites?: string[];
	learningOutcomes?: string[];
}

// 完整的课程信息（链上数据 + IPFS数据）
export interface Course extends CourseOnChain, CourseIPFSData {
	// 这个接口组合了链上和IPFS的所有字段
	// 在实际使用时，链上字段总是可用的，IPFS字段可能有默认值
}

// 创建课程时的表单数据
export interface CourseFormData {
	title: string;
	description: string;
	imageUrl: string;
	price: string; // 字符串形式，用于表单输入（YDT数量）
	contentUrls: string[];
	category?: string;
	tags: string[];
	level?: string; // '初级' | '中级' | '高级' | '专家'
	duration?: string;
	prerequisites: string[];
	learningOutcomes: string[];
}

// 上传到IPFS的数据结构
export interface CourseIPFSUploadData {
	title: string;
	description: string;
	imageUrl: string;
	contentUrls: string[];
	category?: string;
	tags?: string[];
	level?: string;
	duration?: string;
	prerequisites?: string[];
	learningOutcomes?: string[];
}

// 课程统计信息
export interface CourseStats {
	totalStudents: number;
	totalRevenue: bigint;
	isActive: boolean;
}

// 课程购买记录
export interface CourseEnrollment {
	courseId: number;
	student: string;
	enrolledAt: number;
	hasAccess: boolean;
}

// 合约返回的原始课程数据类型
export interface RawCourseData {
	id: bigint;
	ipfsCid: string;
	price: bigint;
	instructor: string;
	isActive: boolean;
	createdAt: bigint;
	totalStudents: bigint;
}

// 课程分类枚举
export const COURSE_CATEGORIES = [
	'编程开发',
	'区块链',
	'人工智能',
	'数据科学',
	'设计',
	'商业',
	'其他',
] as const;

export type CourseCategory = (typeof COURSE_CATEGORIES)[number];

// 课程等级枚举
export const COURSE_LEVELS = ['初级', '中级', '高级', '专家'] as const;
export type CourseLevel = (typeof COURSE_LEVELS)[number];

// 表单验证规则
export const VALIDATION_RULES = {
	title: {
		minLength: 5,
		maxLength: 100,
	},
	description: {
		minLength: 20,
		maxLength: 2000,
	},
	price: {
		min: 0,
		max: 10000,
	},
	category: {
		maxLength: 50,
	},
	duration: {
		maxLength: 50,
	},
	tags: {
		maxCount: 10,
		maxLength: 20,
	},
	contentUrls: {
		minCount: 1,
	},
} as const;

// 课程状态
export interface CourseStatus {
	isLoading: boolean;
	isEnrolled: boolean;
	isOwner: boolean;
	canEnroll: boolean;
	error?: string;
}

// 课程操作结果
export interface CourseActionResult {
	success: boolean;
	txHash?: string;
	ipfsHash?: string;
	error?: string;
}

// 课程搜索和过滤
export interface CourseFilters {
	category?: CourseCategory;
	level?: CourseLevel;
	priceRange?: {
		min: number;
		max: number;
	};
	tags?: string[];
	instructor?: string;
	searchTerm?: string;
}

// 课程排序选项
export const COURSE_SORT_OPTIONS = [
	{ value: 'newest', label: '最新创建' },
	{ value: 'oldest', label: '最早创建' },
	{ value: 'price_low', label: '价格从低到高' },
	{ value: 'price_high', label: '价格从高到低' },
	{ value: 'students', label: '学生数量' },
	{ value: 'rating', label: '评分' },
] as const;

export type CourseSortOption = (typeof COURSE_SORT_OPTIONS)[number]['value'];
