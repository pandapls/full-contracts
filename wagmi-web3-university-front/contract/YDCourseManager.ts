import { Address } from "viem";

export const YD_COURSE_MANAGER_ADDRESS: Address =
	'0xcc9ba443A9b27fdC00fbbBc7DFdaBaeC919a242f';
export const YD_COURSE_MANAGER_ABI = [
	{
		inputs: [
			{
				internalType: 'address',
				name: '_ydTokenAddress',
				type: 'address',
			},
		],
		stateMutability: 'nonpayable',
		type: 'constructor',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: 'owner',
				type: 'address',
			},
		],
		name: 'OwnableInvalidOwner',
		type: 'error',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: 'account',
				type: 'address',
			},
		],
		name: 'OwnableUnauthorizedAccount',
		type: 'error',
	},
	{
		inputs: [],
		name: 'ReentrancyGuardReentrantCall',
		type: 'error',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'uint256',
				name: 'courseId',
				type: 'uint256',
			},
			{
				indexed: true,
				internalType: 'address',
				name: 'instructor',
				type: 'address',
			},
			{
				indexed: false,
				internalType: 'string',
				name: 'ipfsCid',
				type: 'string',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'price',
				type: 'uint256',
			},
		],
		name: 'CourseCreated',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'uint256',
				name: 'courseId',
				type: 'uint256',
			},
			{
				indexed: true,
				internalType: 'address',
				name: 'student',
				type: 'address',
			},
			{
				indexed: true,
				internalType: 'address',
				name: 'instructor',
				type: 'address',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'price',
				type: 'uint256',
			},
		],
		name: 'CoursePurchased',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'uint256',
				name: 'courseId',
				type: 'uint256',
			},
			{
				indexed: true,
				internalType: 'address',
				name: 'instructor',
				type: 'address',
			},
			{
				indexed: false,
				internalType: 'bool',
				name: 'isActive',
				type: 'bool',
			},
		],
		name: 'CourseStatusToggled',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'uint256',
				name: 'courseId',
				type: 'uint256',
			},
			{
				indexed: true,
				internalType: 'address',
				name: 'instructor',
				type: 'address',
			},
			{
				indexed: false,
				internalType: 'string',
				name: 'newIpfsCid',
				type: 'string',
			},
		],
		name: 'CourseUpdated',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'previousOwner',
				type: 'address',
			},
			{
				indexed: true,
				internalType: 'address',
				name: 'newOwner',
				type: 'address',
			},
		],
		name: 'OwnershipTransferred',
		type: 'event',
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: '_courseId',
				type: 'uint256',
			},
			{
				internalType: 'address',
				name: '_student',
				type: 'address',
			},
		],
		name: 'checkEnrollment',
		outputs: [
			{
				internalType: 'bool',
				name: '',
				type: 'bool',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		name: 'courseStudents',
		outputs: [
			{
				internalType: 'address',
				name: '',
				type: 'address',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		name: 'courses',
		outputs: [
			{
				internalType: 'uint256',
				name: 'id',
				type: 'uint256',
			},
			{
				internalType: 'string',
				name: 'ipfsCid',
				type: 'string',
			},
			{
				internalType: 'uint256',
				name: 'price',
				type: 'uint256',
			},
			{
				internalType: 'address',
				name: 'instructor',
				type: 'address',
			},
			{
				internalType: 'bool',
				name: 'isActive',
				type: 'bool',
			},
			{
				internalType: 'uint256',
				name: 'createdAt',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: 'totalStudents',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'string',
				name: '_ipfsCid',
				type: 'string',
			},
			{
				internalType: 'uint256',
				name: '_price',
				type: 'uint256',
			},
		],
		name: 'createCourse',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [],
		name: 'emergencyPause',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: '_offset',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: '_limit',
				type: 'uint256',
			},
		],
		name: 'getActiveCourses',
		outputs: [
			{
				components: [
					{
						internalType: 'uint256',
						name: 'id',
						type: 'uint256',
					},
					{
						internalType: 'string',
						name: 'ipfsCid',
						type: 'string',
					},
					{
						internalType: 'uint256',
						name: 'price',
						type: 'uint256',
					},
					{
						internalType: 'address',
						name: 'instructor',
						type: 'address',
					},
					{
						internalType: 'bool',
						name: 'isActive',
						type: 'bool',
					},
					{
						internalType: 'uint256',
						name: 'createdAt',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'totalStudents',
						type: 'uint256',
					},
				],
				internalType: 'struct YDCourseManager.Course[]',
				name: '',
				type: 'tuple[]',
			},
			{
				internalType: 'uint256',
				name: 'totalCount',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: '_courseId',
				type: 'uint256',
			},
		],
		name: 'getCourse',
		outputs: [
			{
				components: [
					{
						internalType: 'uint256',
						name: 'id',
						type: 'uint256',
					},
					{
						internalType: 'string',
						name: 'ipfsCid',
						type: 'string',
					},
					{
						internalType: 'uint256',
						name: 'price',
						type: 'uint256',
					},
					{
						internalType: 'address',
						name: 'instructor',
						type: 'address',
					},
					{
						internalType: 'bool',
						name: 'isActive',
						type: 'bool',
					},
					{
						internalType: 'uint256',
						name: 'createdAt',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'totalStudents',
						type: 'uint256',
					},
				],
				internalType: 'struct YDCourseManager.Course',
				name: '',
				type: 'tuple',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: '_courseId',
				type: 'uint256',
			},
		],
		name: 'getCourseBasicInfo',
		outputs: [
			{
				internalType: 'uint256',
				name: 'id',
				type: 'uint256',
			},
			{
				internalType: 'string',
				name: 'ipfsCid',
				type: 'string',
			},
			{
				internalType: 'uint256',
				name: 'price',
				type: 'uint256',
			},
			{
				internalType: 'address',
				name: 'instructor',
				type: 'address',
			},
			{
				internalType: 'bool',
				name: 'isActive',
				type: 'bool',
			},
			{
				internalType: 'uint256',
				name: 'createdAt',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: 'totalStudents',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: '_courseId',
				type: 'uint256',
			},
		],
		name: 'getCourseIPFS',
		outputs: [
			{
				internalType: 'string',
				name: '',
				type: 'string',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: '_courseId',
				type: 'uint256',
			},
		],
		name: 'getCourseStats',
		outputs: [
			{
				internalType: 'uint256',
				name: 'totalStudents',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: 'totalRevenue',
				type: 'uint256',
			},
			{
				internalType: 'bool',
				name: 'isActive',
				type: 'bool',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: '_courseId',
				type: 'uint256',
			},
		],
		name: 'getCourseStudents',
		outputs: [
			{
				internalType: 'address[]',
				name: '',
				type: 'address[]',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '_instructor',
				type: 'address',
			},
		],
		name: 'getInstructorCourses',
		outputs: [
			{
				internalType: 'uint256[]',
				name: '',
				type: 'uint256[]',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '_student',
				type: 'address',
			},
		],
		name: 'getStudentCourses',
		outputs: [
			{
				internalType: 'uint256[]',
				name: '',
				type: 'uint256[]',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
			{
				internalType: 'address',
				name: '',
				type: 'address',
			},
		],
		name: 'hasEnrolled',
		outputs: [
			{
				internalType: 'bool',
				name: '',
				type: 'bool',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '',
				type: 'address',
			},
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		name: 'instructorCourses',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'nextCourseId',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'owner',
		outputs: [
			{
				internalType: 'address',
				name: '',
				type: 'address',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'platformFeePercentage',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: '_courseId',
				type: 'uint256',
			},
		],
		name: 'purchaseCourse',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [],
		name: 'renounceOwnership',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: '_feePercentage',
				type: 'uint256',
			},
		],
		name: 'setPlatformFeePercentage',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '',
				type: 'address',
			},
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		name: 'studentCourses',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: '_courseId',
				type: 'uint256',
			},
		],
		name: 'toggleCourseStatus',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: 'newOwner',
				type: 'address',
			},
		],
		name: 'transferOwnership',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: '_courseId',
				type: 'uint256',
			},
			{
				internalType: 'string',
				name: '_newIpfsCid',
				type: 'string',
			},
			{
				internalType: 'uint256',
				name: '_newPrice',
				type: 'uint256',
			},
		],
		name: 'updateCourse',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [],
		name: 'ydToken',
		outputs: [
			{
				internalType: 'contract IERC20',
				name: '',
				type: 'address',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
] as const;
