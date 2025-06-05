'use client';

import { useAccount, useBalance, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { YD_TOKEN_ABI, YD_TOKEN_ADDRESS } from '../contract/YDToken';
import { useEffect, useState } from 'react';


const HeaderBalance = () => {
	const [mounted, setMounted] = useState(false);
	const { address, isConnected } = useAccount();

	useEffect(() => {
		setMounted(true);
	}, []);
	// 获取用户 ETH 余额
	const { data: ethBalance } = useBalance({
		address: address,
	});
	const {
		data: balance,
		isError,
		isLoading,
	} = useReadContract({
		address: YD_TOKEN_ADDRESS,
		abi: YD_TOKEN_ABI,
		functionName: 'balanceOf',
		args: address ? [address] : undefined,
		query: {
			enabled: !!address && isConnected,
			refetchInterval: 10000, // 每10秒刷新一次
		},
	});

	const baseStyle =
		'relative px-4 py-2 rounded-xl border border-black bg-white text-black text-base font-medium shadow-[4px_4px_0_0_black] transition-all duration-200';

	// 如果未挂载或钱包未连接，不显示余额
	if (!mounted || !isConnected || !address) {
		return (
			<div
				className={`${baseStyle} w-[160px] h-[40px] animate-pulse text-white`}
			>
				Loading
			</div>
		);
	}

	// 加载中状态
	if (isLoading) {
		return (
			<div
				className={`${baseStyle} w-[140px] h-[40px] animate-pulse flex items-center justify-center`}
			>
				<span>Loading...</span>
			</div>
		);
	}

	// 错误状态
	if (isError) {
		return (
			<div
				className={`${baseStyle} w-[140px] h-[40px] flex items-center justify-center text-red-600`}
			>
				<span>YDT: Error</span>
			</div>
		);
	}

	// 格式化余额显示 (YDT使用18位小数)
	const formattedBalance = (token: bigint | undefined) => {
		return token ? parseFloat(formatUnits(token, 18)).toFixed(2) : '0.00';
	};

	return (
		<div
			className={`${baseStyle} min-w-[140px] h-[40px] flex items-center justify-center space-x-2`}
		>
			<div className='w-2 h-2 bg-blue-500 rounded-full'></div>
			<span>YDT: {formattedBalance(balance)}</span>
			<span>ETH: {formattedBalance(ethBalance?.value)}</span>
		</div>
	);
};

export default HeaderBalance;