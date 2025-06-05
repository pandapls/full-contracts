import React, { useCallback, useState } from 'react';
import { parseEther, parseUnits } from 'viem';
import {
	useAccount,
	useWriteContract,
	useReadContract,
	useWaitForTransactionReceipt,
} from 'wagmi';
import {
	YD_COURSE_MANAGER_ADDRESS,
	YD_COURSE_MANAGER_ABI,
} from '../contract/YDCourseManager';
import { YD_TOKEN_ADDRESS, YD_TOKEN_ABI } from '../contract/YDToken';
import { CourseFormData } from '../types/Course.type';

// Pinata 配置
const PINATA_CONFIG = {
	jwt: process.env.NEXT_PUBLIC_PINATA_JWT || '',
	apiKey: process.env.NEXT_PUBLIC_PINATA_API_KEY || '',
	apiSecret: process.env.NEXT_PUBLIC_PINATA_API_SECRET || '',
};

// IPFS 上传数据接口
interface CourseIPFSData {
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

export const useContractActions = () => {
	const { address } = useAccount();
	const [uploadingToIPFS, setUploadingToIPFS] = useState(false);
	const [ipfsError, setIpfsError] = useState<string | null>(null);

	// 购买代币
	const {
		writeContract: buyTokensWrite,
		isPending: isBuyingTokens,
		data: buyTokensData,
	} = useWriteContract();

	// 卖出代币
	const {
		writeContract: sellTokensWrite,
		isPending: isSellingTokens,
		data: sellTokensData,
	} = useWriteContract();

	// 授权代币
	const {
		writeContract: approveWrite,
		isPending: isApproving,
		data: approveData,
	} = useWriteContract();

	// 购买课程
	const {
		writeContract: purchaseCourseWrite,
		isPending: isPurchasing,
		data: purchaseCourseData,
	} = useWriteContract();

	// 创建课程
	const {
		writeContract: createCourseWrite,
		isPending: isCreating,
		data: createCourseData,
	} = useWriteContract();

	// 等待交易确认
	const {
		isLoading: isWaitingForCreateCourse,
		isSuccess: isCreateCourseSuccess,
	} = useWaitForTransactionReceipt({
		hash: createCourseData,
		query: {
			enabled: !!createCourseData,
		},
	});

	const { isLoading: isWaitingForPurchase, isSuccess: isPurchaseSuccess } =
		useWaitForTransactionReceipt({
			hash: purchaseCourseData,
			query: {
				enabled: !!purchaseCourseData,
			},
		});

	const { isLoading: isWaitingForBuyTokens, isSuccess: isBuyTokensSuccess } =
		useWaitForTransactionReceipt({
			hash: buyTokensData,
			query: {
				enabled: !!buyTokensData,
			},
		});

	const { isLoading: isWaitingForSellTokens, isSuccess: isSellTokensSuccess } =
		useWaitForTransactionReceipt({
			hash: sellTokensData,
			query: {
				enabled: !!sellTokensData,
			},
		});

	const { isLoading: isWaitingForApprove, isSuccess: isApproveSuccess } =
		useWaitForTransactionReceipt({
			hash: approveData,
			query: {
				enabled: !!approveData,
			},
		});

	// 读取 YDT 余额
	const { data: ydtBalance, refetch: refetchYDTBalance } = useReadContract({
		address: YD_TOKEN_ADDRESS,
		abi: YD_TOKEN_ABI,
		functionName: 'balanceOf',
		args: address ? [address] : undefined,
	});

	// 读取对课程管理合约的授权额度
	const { data: allowance, refetch: refetchAllowance } = useReadContract({
		address: YD_TOKEN_ADDRESS,
		abi: YD_TOKEN_ABI,
		functionName: 'allowance',
		args: address ? [address, YD_COURSE_MANAGER_ADDRESS] : undefined,
	});

	// 读取合约的 ETH 余额
	const { data: contractEthBalance, refetch: refetchContractBalance } =
		useReadContract({
			address: YD_TOKEN_ADDRESS,
			abi: YD_TOKEN_ABI,
			functionName: 'getContractETHBalance',
		});

	// 读取卖出手续费比例
	const { data: sellFeePercentage } = useReadContract({
		address: YD_TOKEN_ADDRESS,
		abi: YD_TOKEN_ABI,
		functionName: 'sellFeePercentage',
	});

	// 读取兑换比率
	const { data: exchangeRate } = useReadContract({
		address: YD_TOKEN_ADDRESS,
		abi: YD_TOKEN_ABI,
		functionName: 'EXCHANGE_RATE',
	});

	// 获取卖出报价
	const getSellQuoteForAmount = (tokenAmount: string) => {
		const amountInWei =
			tokenAmount && parseFloat(tokenAmount) > 0
				? parseUnits(tokenAmount, 18)
				: undefined;

		return useReadContract({
			address: YD_TOKEN_ADDRESS,
			abi: YD_TOKEN_ABI,
			functionName: 'getSellQuote',
			args: amountInWei ? [amountInWei] : undefined,
			query: {
				enabled: !!amountInWei,
			},
		});
	};

	// 上传数据到 Pinata IPFS
	const uploadToIPFS = useCallback(
		async (data: CourseIPFSData): Promise<string> => {
			setUploadingToIPFS(true);
			setIpfsError(null);

			try {
				const body = {
					pinataContent: data,
					pinataMetadata: {
						name: `course-${data.title}-${Date.now()}`,
						keyvalues: {
							type: 'course-metadata',
							timestamp: new Date().toISOString(),
							title: data.title,
						},
					},
					pinataOptions: {
						cidVersion: 1,
					},
				};

				const headers: Record<string, string> = {
					'Content-Type': 'application/json',
				};

				// 优先使用JWT
				if (PINATA_CONFIG.jwt) {
					headers['Authorization'] = `Bearer ${PINATA_CONFIG.jwt}`;
				} else if (PINATA_CONFIG.apiKey && PINATA_CONFIG.apiSecret) {
					headers['pinata_api_key'] = PINATA_CONFIG.apiKey;
					headers['pinata_secret_api_key'] = PINATA_CONFIG.apiSecret;
				} else {
					throw new Error('Pinata API credentials not configured');
				}

				console.log('上传课程数据到 Pinata IPFS:', data);

				const response = await fetch(
					'https://api.pinata.cloud/pinning/pinJSONToIPFS',
					{
						method: 'POST',
						headers,
						body: JSON.stringify(body),
					}
				);

				if (!response.ok) {
					const errorText = await response.text();
					throw new Error(
						`Pinata upload failed: ${response.status} - ${errorText}`
					);
				}

				const result = await response.json();
				console.log('Pinata 上传成功:', result);

				return result.IpfsHash;
			} catch (error) {
				console.error('IPFS upload error:', error);
				const errorMessage =
					error instanceof Error ? error.message : 'IPFS upload failed';
				setIpfsError(errorMessage);
				throw new Error(errorMessage);
			} finally {
				setUploadingToIPFS(false);
			}
		},
		[]
	);

	// 授权 YDT 给课程管理合约
	const handleApprove = useCallback(
		async (amount: string) => {
			if (!address) throw new Error('Wallet not connected');

			const amountInWei = parseUnits(amount, 18);

			try {
				await approveWrite({
					address: YD_TOKEN_ADDRESS,
					abi: YD_TOKEN_ABI,
					functionName: 'approve',
					args: [YD_COURSE_MANAGER_ADDRESS, amountInWei],
				});

				// 等待交易确认后刷新授权额度
				// 这个刷新会在 isApproveSuccess 变化时触发
			} catch (error) {
				console.error('Approve failed:', error);
				throw error;
			}
		},
		[address, approveWrite]
	);

	// 购买课程
	const handlePurchaseCourse = useCallback(
		async (courseId: number) => {
			if (!address) {
				throw new Error('Wallet not connected');
			}

			try {
				await purchaseCourseWrite({
					address: YD_COURSE_MANAGER_ADDRESS,
					abi: YD_COURSE_MANAGER_ABI,
					functionName: 'purchaseCourse',
					args: [BigInt(courseId)],
				});
			} catch (error) {
				console.error('Purchase course failed:', error);
				throw error;
			}
		},
		[address, purchaseCourseWrite]
	);

	// 创建课程 - 集成 IPFS 上传
	const handleCreateCourse = useCallback(
		async (courseData: CourseFormData): Promise<string> => {
			if (!address) {
				throw new Error('Wallet not connected');
			}

			try {
				console.log('开始创建课程流程:', courseData);

				// 1. 准备 IPFS metadata
				const ipfsData: CourseIPFSData = {
					title: courseData.title,
					description: courseData.description,
					imageUrl: courseData.imageUrl,
					contentUrls: courseData.contentUrls,
					category: courseData.category,
					tags: courseData.tags,
					level: courseData.level,
					duration: courseData.duration,
					prerequisites: courseData.prerequisites,
					learningOutcomes: courseData.learningOutcomes,
				};

				// 2. 上传到 IPFS
				console.log('上传 metadata 到 IPFS...');
				const ipfsHash = await uploadToIPFS(ipfsData);
				console.log('IPFS 上传成功，CID:', ipfsHash);

				// 3. 调用合约创建课程
				console.log('调用合约创建课程...');
				await createCourseWrite({
					address: YD_COURSE_MANAGER_ADDRESS,
					abi: YD_COURSE_MANAGER_ABI,
					functionName: 'createCourse',
					args: [ipfsHash, parseUnits(courseData.price, 18)], // 使用 YDT 精度
				});

				console.log('课程创建交易已提交，等待确认...');
				return ipfsHash;
			} catch (error) {
				console.error('Create course failed:', error);
				throw error;
			}
		},
		[address, createCourseWrite, uploadToIPFS]
	);

	// 购买代币
	const handleBuyTokens = useCallback(
		async (ethAmount: string) => {
			if (!address) {
				throw new Error('Wallet not connected');
			}

			try {
				await buyTokensWrite({
					address: YD_TOKEN_ADDRESS,
					abi: YD_TOKEN_ABI,
					functionName: 'buyTokens',
					value: parseEther(ethAmount),
				});
			} catch (error) {
				console.error('Buy tokens failed:', error);
				throw error;
			}
		},
		[address, buyTokensWrite]
	);

	// 卖出代币
	const handleSellTokens = useCallback(
		async (tokenAmount: string) => {
			if (!address) {
				throw new Error('Wallet not connected');
			}

			// 验证 tokenAmount 格式
			if (!/^\d+(\.\d+)?$/.test(tokenAmount)) {
				throw new Error('Invalid token amount format');
			}

			const amountInWei = parseUnits(tokenAmount, 18);

			// 检查 YDT 余额
			if (ydtBalance && ydtBalance < amountInWei) {
				throw new Error('Insufficient YDT balance');
			}

			// 检查合约 ETH 余额
			if (contractEthBalance && exchangeRate) {
				const requiredEth = amountInWei / exchangeRate;
				if (contractEthBalance < requiredEth) {
					throw new Error(
						'Contract does not have enough ETH for this trade. Please try a smaller amount or contact support.'
					);
				}
			}

			try {
				await sellTokensWrite({
					address: YD_TOKEN_ADDRESS,
					abi: YD_TOKEN_ABI,
					functionName: 'sellTokens',
					args: [amountInWei],
				});
			} catch (error: any) {
				console.error('Sell tokens failed:', error);

				// 提供更友好的错误信息
				if (error.message?.includes('Contract ETH balance insufficient')) {
					throw new Error('Contract does not have enough ETH for this trade');
				} else if (error.message?.includes('Insufficient token balance')) {
					throw new Error('You do not have enough YDT tokens');
				} else if (error.message?.includes('Token amount too small')) {
					throw new Error('Token amount is too small to trade');
				} else if (error.message?.includes('Internal JSON-RPC error')) {
					throw new Error(
						'Transaction failed: Contract may not have enough ETH or network issue'
					);
				} else if (error.message?.includes('User rejected')) {
					throw new Error('Transaction cancelled by user');
				}

				throw error;
			}
		},
		[address, sellTokensWrite, ydtBalance, contractEthBalance, exchangeRate]
	);

	// 当交易成功时自动刷新相关数据
	React.useEffect(() => {
		if (isApproveSuccess) {
			refetchAllowance();
		}
	}, [isApproveSuccess, refetchAllowance]);

	React.useEffect(() => {
		if (isBuyTokensSuccess || isSellTokensSuccess) {
			refetchYDTBalance();
			refetchContractBalance();
		}
	}, [
		isBuyTokensSuccess,
		isSellTokensSuccess,
		refetchYDTBalance,
		refetchContractBalance,
	]);

	return {
		// 购买课程
		purchaseCourse: handlePurchaseCourse,
		isPurchasing,
		isWaitingForPurchase,
		isPurchaseSuccess,

		// 创建课程 (包含 IPFS 上传)
		createCourse: handleCreateCourse,
		isCreating: isCreating || uploadingToIPFS,
		isWaitingForCreateCourse,
		isCreateCourseSuccess,
		uploadingToIPFS,
		ipfsError,

		// 购买代币
		buyTokens: handleBuyTokens,
		isBuyingTokens,
		isWaitingForBuyTokens,
		isBuyTokensSuccess,

		// 卖出代币
		sellTokens: handleSellTokens,
		isSellingTokens,
		isWaitingForSellTokens,
		isSellTokensSuccess,

		// 授权相关
		handleApprove,
		isApproving,
		isWaitingForApprove,
		isApproveSuccess,
		allowance,

		// 工具函数
		getSellQuoteForAmount,
		uploadToIPFS, // 暴露IPFS上传功能

		// 用户地址和余额
		userAddress: address,
		ydtBalance,
		contractEthBalance,
		sellFeePercentage,
		exchangeRate,

		// 刷新函数
		refetchYDTBalance,
		refetchAllowance,
		refetchContractBalance,
	};
};
