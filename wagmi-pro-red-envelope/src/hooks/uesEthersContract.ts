import { useState, useEffect, useCallback, useMemo } from 'react';
import {
	Contract,
	ContractTransactionResponse,
	ContractTransactionReceipt,
	ethers,
} from 'ethers';

import { useWallet } from './useEthersWallet';

interface UseReadConfig {
	address: string;
	abi: readonly any[];
	functionName: string;
	args?: any[];
	enabled?: boolean;
	watch?: boolean;
}

interface UseReadResult<T = any> {
	data: T | null;
	error: Error | null;
	loading: boolean;
	refetch: () => Promise<void>;
}
export function useRead<T = any>(config: UseReadConfig): UseReadResult<T> {
	const { provider } = useWallet(); // 使用你的 useWallet hook
	const [data, setData] = useState<T | null>(null);
	const [error, setError] = useState<Error | null>(null);
	const [loading, setLoading] = useState(false);

	const {
		address,
		abi,
		functionName,
		args = [],
		enabled = true,
		watch = false,
	} = config;
	const stableArgs = useMemo(() => args, [JSON.stringify(args)]);
	// 创建只读合约实例（连接到 provider）
	const contract = useMemo(() => {
		if (!provider || !address || !abi) return null;
		return new Contract(address, abi, provider);
	}, [provider, address, abi]);

	// 读取数据的函数
	const fetchData = useCallback(async () => {
		if (!contract || !enabled) return;

		setLoading(true);
		setError(null);

		try {
			// 检查函数是否存在
			if (!contract.interface.hasFunction(functionName)) {
				throw new Error(`Function ${functionName} not found in contract ABI`);
			}

			console.log(`📞 Calling ${functionName} with args:`, args);
			const result = await contract[functionName](...args);

			console.log(`✅ ${functionName} success:`, result);
			setData(result);
		} catch (err) {
			console.error('Read contract error:', err);
			setError(err as Error);
			setData(null);
		} finally {
			setLoading(false);
		}
	}, [contract, functionName, stableArgs, enabled]);

	// 初始加载和依赖变化时重新获取
	useEffect(() => {
		fetchData();
	}, [fetchData]);

	// 监听区块变化（如果启用 watch）
	useEffect(() => {
		if (!watch || !provider || !enabled) return;

		const handleBlock = () => {
			fetchData();
		};

		// 监听新区块
		provider.on('block', handleBlock);

		return () => {
			provider.off('block', handleBlock);
		};
	}, [watch, provider, enabled, fetchData]);

	return {
		data,
		error,
		loading,
		refetch: fetchData,
	};
}
