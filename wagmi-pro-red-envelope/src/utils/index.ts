import { formatEther } from 'viem';

export const formatBalance = (balance: bigint) => {
	if (!balance) return '0';
	const ethValue = parseFloat(formatEther(balance));

	// 如果小于 0.0001，显示为 < 0.0001
	if (ethValue > 0 && ethValue < 0.0001) {
		return '< 0.0001';
	}

	// 如果小于 1，保留 4 位小数
	if (ethValue < 1) {
		return ethValue.toFixed(4);
	}

	// 如果大于等于 1，保留 2 位小数
	return ethValue.toFixed(2);
};
