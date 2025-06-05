// 代币余额Hook
import { useMemo } from 'react';
import { formatEther } from 'viem';
import { useReadContract } from 'wagmi';
import { YD_TOKEN_ADDRESS, YD_TOKEN_ABI } from '../contract/YDToken';

export const useTokenBalance = (address?: `0x${string}`) => {
	const {
		data: balance,
		isLoading,
		refetch,
	} = useReadContract({
		address: YD_TOKEN_ADDRESS,
		abi: YD_TOKEN_ABI,
		functionName: 'balanceOf',
		args: [address || '0x0'],
	});

	const formattedBalance = useMemo(() => {
		return balance ? formatEther(balance) : '0';
	}, [balance]);

	return {
		balance: balance,
		formattedBalance,
		loading: isLoading,
		refetch,
	};
};
