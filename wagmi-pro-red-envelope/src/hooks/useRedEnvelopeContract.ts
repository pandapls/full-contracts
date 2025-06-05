'use client';
import {
	useReadContract,
	useWriteContract,
	useWaitForTransactionReceipt,
} from 'wagmi';
import { parseEther } from 'viem';
import type { Address } from 'viem';
import {
	RED_ENVELPOE_CONTRACT_ADDRESS,
	RED_ENVELPOE_CONTRACT_ADDRESS_ABI,
} from '../constants/contract';
import type {
	RedEnvelopeData,
	ContractWrites,
	GrabInfo,
} from '../types/contract';

export const useRedEnvelopeReads = (
	address?: Address
): RedEnvelopeData & { refreshData: () => void } => {
	const { data: totalAmount, refetch: refetchTotalAmount } = useReadContract({
		address: RED_ENVELPOE_CONTRACT_ADDRESS as Address,
		abi: RED_ENVELPOE_CONTRACT_ADDRESS_ABI,
		functionName: 'totalAmount',
	});

	const { data: redEnvelopeCount, refetch: refetchCount } = useReadContract({
		address: RED_ENVELPOE_CONTRACT_ADDRESS as Address,
		abi: RED_ENVELPOE_CONTRACT_ADDRESS_ABI,
		functionName: 'count',
	});

	const { data: grabbedCount, refetch: refetchGrabbedCount } = useReadContract({
		address: RED_ENVELPOE_CONTRACT_ADDRESS as Address,
		abi: RED_ENVELPOE_CONTRACT_ADDRESS_ABI,
		functionName: 'grabbedCount',
	});

	const { data: isRedEnvelopeSet, refetch: refetchIsSet } = useReadContract({
		address: RED_ENVELPOE_CONTRACT_ADDRESS as Address,
		abi: RED_ENVELPOE_CONTRACT_ADDRESS_ABI,
		functionName: 'isRedEnvelopeSet',
	});

	const { data: remainingCount, refetch: refetchRemaining } = useReadContract({
		address: RED_ENVELPOE_CONTRACT_ADDRESS as Address,
		abi: RED_ENVELPOE_CONTRACT_ADDRESS_ABI,
		functionName: 'getRemainingCount',
	});

	const { data: userGrabInfoRaw, refetch: refetchUserGrabInfo } =
		useReadContract({
			address: RED_ENVELPOE_CONTRACT_ADDRESS as Address,
			abi: RED_ENVELPOE_CONTRACT_ADDRESS_ABI,
			functionName: 'getUserGrabInfo',
			args: address ? [address] : undefined,
		});

	const { data: redOwner, refetch: refetchRedOwner } = useReadContract({
		address: RED_ENVELPOE_CONTRACT_ADDRESS as Address,
		abi: RED_ENVELPOE_CONTRACT_ADDRESS_ABI,
		functionName: 'redOwner',
		query: {
			enabled: Boolean(isRedEnvelopeSet), // 只有在红包设置后才查询
		},
	});

	const { data: isEqualDistribution, refetch: refetchIsEqual } =
		useReadContract({
			address: RED_ENVELPOE_CONTRACT_ADDRESS as Address,
			abi: RED_ENVELPOE_CONTRACT_ADDRESS_ABI,
			functionName: 'isEqual',
			query: {
				enabled: Boolean(isRedEnvelopeSet),
			},
		});

	const { data: allGrabbers, refetch: refetchAllGrabbers } = useReadContract({
		address: RED_ENVELPOE_CONTRACT_ADDRESS as Address,
		abi: RED_ENVELPOE_CONTRACT_ADDRESS_ABI,
		functionName: 'getAllGrabbers',
		query: {
			enabled: Boolean(isRedEnvelopeSet),
		},
	});

	const { data: contracBlance, refetch: referchContracBlance } =
		useReadContract({
			address: RED_ENVELPOE_CONTRACT_ADDRESS as Address,
			abi: RED_ENVELPOE_CONTRACT_ADDRESS_ABI,
			functionName: 'getContractBalance',
		});

	const refreshData = (): void => {
		refetchTotalAmount();
		refetchCount();
		refetchGrabbedCount();
		refetchIsSet();
		refetchRemaining();
		refetchUserGrabInfo();
		refetchAllGrabbers();
		referchContracBlance();
		refetchRedOwner();
		refetchIsEqual();
	};

	// 处理 userGrabInfo 数据结构
	const userGrabInfo: GrabInfo | undefined = userGrabInfoRaw
		? {
				amount: (userGrabInfoRaw as any)[0] as bigint,
				hasGrabbed: (userGrabInfoRaw as any)[1] as boolean,
				grabTime: (userGrabInfoRaw as any)[2] as bigint,
				grabIndex: (userGrabInfoRaw as any)[3] as bigint,
			}
		: undefined;

	return {
		totalAmount: totalAmount as bigint | undefined,
		redEnvelopeCount: redEnvelopeCount as bigint | undefined,
		grabbedCount: grabbedCount as bigint | undefined,
		isRedEnvelopeSet: isRedEnvelopeSet as boolean | undefined,
		remainingCount: remainingCount as bigint | undefined,
		userGrabInfo,
		redOwner: redOwner as string | undefined,
		isEqualDistribution: isEqualDistribution as boolean | undefined,
		allGrabbers: allGrabbers as string[] | undefined,
		refreshData,
		contracBlance,
	};
};

export const useRedEnvelopeWrites = (): ContractWrites => {
	const {
		writeContract: writeSetRedEnvelope,
		data: setHash,
		isPending: isSetPending,
	} = useWriteContract();

	const {
		writeContract: writeGrabRedEnvelope,
		data: grabHash,
		isPending: isGrabPending,
	} = useWriteContract();

	const { isLoading: isSetConfirming, isSuccess: isSetSuccess } =
		useWaitForTransactionReceipt({ hash: setHash });

	const { isLoading: isGrabConfirming, isSuccess: isGrabSuccess } =
		useWaitForTransactionReceipt({ hash: grabHash });

	const createRedEnvelope = (
		amount: string,
		count: string,
		isEqual: boolean
	): void => {
		writeSetRedEnvelope({
			address: RED_ENVELPOE_CONTRACT_ADDRESS as Address,
			abi: RED_ENVELPOE_CONTRACT_ADDRESS_ABI,
			functionName: 'setRedEnvelope',
			args: [BigInt(count), isEqual],
			value: parseEther(amount),
		});
	};

	const grabRedEnvelope = (): void => {
		writeGrabRedEnvelope({
			address: RED_ENVELPOE_CONTRACT_ADDRESS as Address,
			abi: RED_ENVELPOE_CONTRACT_ADDRESS_ABI,
			functionName: 'grabRedEnvelope',
		});
	};
	return {
		createRedEnvelope,
		grabRedEnvelope,
		isSetPending: isSetPending || false,
		isSetConfirming: isSetConfirming || false,
		isSetSuccess: isSetSuccess || false,
		isGrabPending: isGrabPending || false,
		isGrabConfirming: isGrabConfirming || false,
		isGrabSuccess: isGrabSuccess || false,
	};
};
