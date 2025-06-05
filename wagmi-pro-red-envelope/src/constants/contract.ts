export const RED_ENVELPOE_CONTRACT_ADDRESS =
	'0xd642B0e60EB45d53E78497798Fc589c17d15111c' as const;

export const RED_ENVELPOE_CONTRACT_ADDRESS_ABI = [
	{
		inputs: [],
		stateMutability: 'nonpayable',
		type: 'constructor',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: 'address',
				name: 'grabber',
				type: 'address',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'amount',
				type: 'uint256',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'grabIndex',
				type: 'uint256',
			},
		],
		name: 'RedEnvelopeGrabbed',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: 'uint256',
				name: 'totalAmount',
				type: 'uint256',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'count',
				type: 'uint256',
			},
			{
				indexed: false,
				internalType: 'bool',
				name: 'isEqual',
				type: 'bool',
			},
		],
		name: 'RedEnvelopeSet',
		type: 'event',
	},
	{
		inputs: [],
		name: 'count',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
		constant: true,
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '',
				type: 'address',
			},
		],
		name: 'grabInfos',
		outputs: [
			{
				internalType: 'uint256',
				name: 'amount',
				type: 'uint256',
			},
			{
				internalType: 'bool',
				name: 'hasGrabbed',
				type: 'bool',
			},
			{
				internalType: 'uint256',
				name: 'grabTime',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: 'grabIndex',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
		constant: true,
	},
	{
		inputs: [],
		name: 'grabbedCount',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
		constant: true,
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		name: 'grabbers',
		outputs: [
			{
				internalType: 'address',
				name: '',
				type: 'address',
			},
		],
		stateMutability: 'view',
		type: 'function',
		constant: true,
	},
	{
		inputs: [],
		name: 'isEqual',
		outputs: [
			{
				internalType: 'bool',
				name: '',
				type: 'bool',
			},
		],
		stateMutability: 'view',
		type: 'function',
		constant: true,
	},
	{
		inputs: [],
		name: 'isRedEnvelopeSet',
		outputs: [
			{
				internalType: 'bool',
				name: '',
				type: 'bool',
			},
		],
		stateMutability: 'view',
		type: 'function',
		constant: true,
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
		constant: true,
	},
	{
		inputs: [],
		name: 'redOwner',
		outputs: [
			{
				internalType: 'address payable',
				name: '',
				type: 'address',
			},
		],
		stateMutability: 'view',
		type: 'function',
		constant: true,
	},
	{
		inputs: [],
		name: 'totalAmount',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
		constant: true,
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: '_count',
				type: 'uint256',
			},
			{
				internalType: 'bool',
				name: '_isEqual',
				type: 'bool',
			},
		],
		name: 'setRedEnvelope',
		outputs: [],
		stateMutability: 'payable',
		type: 'function',
		payable: true,
	},
	{
		inputs: [],
		name: 'grabRedEnvelope',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: 'user',
				type: 'address',
			},
		],
		name: 'getUserGrabInfo',
		outputs: [
			{
				internalType: 'uint256',
				name: 'amount',
				type: 'uint256',
			},
			{
				internalType: 'bool',
				name: 'hasGrabbed',
				type: 'bool',
			},
			{
				internalType: 'uint256',
				name: 'grabTime',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: 'grabIndex',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
		constant: true,
	},
	{
		inputs: [],
		name: 'getAllGrabbers',
		outputs: [
			{
				internalType: 'address[]',
				name: '',
				type: 'address[]',
			},
		],
		stateMutability: 'view',
		type: 'function',
		constant: true,
	},
	{
		inputs: [],
		name: 'getRemainingCount',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
		constant: true,
	},
	{
		inputs: [],
		name: 'getContractBalance',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
		constant: true,
	},
] as const;
