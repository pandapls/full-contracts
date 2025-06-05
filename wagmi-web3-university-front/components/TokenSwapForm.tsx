'use client';
import { useEffect, useState } from 'react';
import { formatEther } from 'viem';
import { useAccount, useBalance } from 'wagmi';
import { useContractActions } from '../hooks/useContractActions';
import { useToast } from '../hooks/useToast';
import { ToastType } from './Toast/Toast.type';

const TokenSwapForm = () => {
	const [amount, setAmount] = useState('');
	const [swapDirection, setSwapDirection] = useState<'buy' | 'sell'>('buy');

	const { addToast } = useToast();
	const { address, isConnected } = useAccount();

	// 使用修正后的 useContractActions
	const {
		buyTokens,
		sellTokens,
		isBuyingTokens,
		isSellingTokens,
		ydtBalance,
		contractEthBalance,
		sellFeePercentage,
		exchangeRate,
		getSellQuoteForAmount,
		refetchYDTBalance,
		refetchContractBalance,
	} = useContractActions();

	// 获取用户 ETH 余额
	const { data: ethBalance } = useBalance({
		address: address,
	});

	// 获取卖出报价
	const { data: sellQuoteData } = getSellQuoteForAmount(
		swapDirection === 'sell' ? amount : ''
	);

	// 计算输出数量
	const calculateOutputAmount = () => {
		if (!amount || parseFloat(amount) <= 0) return '0';

		try {
			if (swapDirection === 'buy') {
				// ETH -> YDT
				if (!exchangeRate) return '0';
				const ethValue = parseFloat(amount);
				const rate = Number(exchangeRate);
				return (ethValue * rate).toLocaleString();
			} else {
				// YDT -> ETH
				if (sellQuoteData && sellQuoteData[0]) {
					return formatEther(sellQuoteData[0]); // 净ETH数量
				}

				// Fallback 计算
				if (exchangeRate && sellFeePercentage !== undefined) {
					const ydtValue = parseFloat(amount);
					const rate = Number(exchangeRate);
					const feePercent = Number(sellFeePercentage);
					const grossEth = ydtValue / rate;
					const netEth = grossEth * (1 - feePercent / 100);
					return netEth.toFixed(8);
				}

				return '0';
			}
		} catch {
			return '0';
		}
	};

	// 设置最大值
	const setMaxAmount = () => {
		if (swapDirection === 'buy' && ethBalance) {
			// 保留少量 ETH 用于 gas 费
			const maxAmount = Math.max(
				0,
				parseFloat(formatEther(ethBalance.value)) - 0.01
			);
			setAmount(maxAmount.toFixed(6));
		} else if (swapDirection === 'sell' && ydtBalance) {
			// YDT 最大值
			const maxAmount = parseFloat(formatEther(ydtBalance));
			setAmount(maxAmount.toFixed(6));
		}
	};

	// 切换兑换方向
	const toggleSwapDirection = () => {
		setSwapDirection((prev) => (prev === 'buy' ? 'sell' : 'buy'));
		setAmount('');
	};

	// 检查余额是否充足
	const checkSufficientBalance = () => {
		if (!amount || parseFloat(amount) <= 0) return false;

		if (swapDirection === 'buy') {
			return (
				ethBalance &&
				parseFloat(formatEther(ethBalance.value)) >= parseFloat(amount)
			);
		} else {
			return (
				ydtBalance && parseFloat(formatEther(ydtBalance)) >= parseFloat(amount)
			);
		}
	};

	// 检查合约ETH余额是否充足（卖出时）
	const checkContractBalance = () => {
		if (
			swapDirection === 'sell' &&
			contractEthBalance &&
			exchangeRate &&
			amount
		) {
			const requiredEth = parseFloat(amount) / Number(exchangeRate);
			const contractEthFloat = parseFloat(formatEther(contractEthBalance));
			return contractEthFloat >= requiredEth;
		}
		return true;
	};

	// 处理兑换
	const handleSwap = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!amount || parseFloat(amount) <= 0) {
			addToast('请输入有效的数量', ToastType.WARNING);
			return;
		}

		if (!checkSufficientBalance()) {
			addToast(
				`${swapDirection === 'buy' ? 'ETH' : 'YDT'} 余额不足`,
				ToastType.ERROR
			);
			return;
		}

		if (!checkContractBalance()) {
			addToast('合约ETH余额不足，无法完成卖出交易', ToastType.ERROR);
			return;
		}

		try {
			if (swapDirection === 'buy') {
				await buyTokens(amount);
				addToast('购买交易已提交，请等待确认', ToastType.SUCCESS);
			} else {
				await sellTokens(amount);
				addToast('卖出交易已提交，请等待确认', ToastType.SUCCESS);
			}

			// 清空输入
			setAmount('');
		} catch (err: any) {
			console.error('Swap error:', err);

			let errorMessage = '交易失败，请重试';

			if (
				err.message?.includes('User rejected') ||
				err.message?.includes('cancelled by user')
			) {
				errorMessage = '用户取消了交易';
			} else if (err.message?.includes('insufficient funds')) {
				errorMessage = '余额不足或Gas费不够';
			} else if (err.message?.includes('Contract does not have enough ETH')) {
				errorMessage = '合约ETH余额不足，请联系管理员或稍后再试';
			} else if (err.message?.includes('Insufficient YDT balance')) {
				errorMessage = 'YDT余额不足';
			} else if (err.message?.includes('Token amount too small')) {
				errorMessage = '代币数量太少，无法交易';
			} else if (err.message?.includes('Internal JSON-RPC error')) {
				errorMessage = '网络错误或合约状态异常，请稍后重试';
			} else if (err.message) {
				errorMessage = err.message;
			}

			addToast(errorMessage, ToastType.ERROR);
		}
	};

	// 判断是否正在处理交易
	const isLoading = isBuyingTokens || isSellingTokens;

	// 判断按钮是否应该禁用
	const isButtonDisabled = () => {
		return (
			!amount ||
			parseFloat(amount) <= 0 ||
			isLoading ||
			!checkSufficientBalance() ||
			!checkContractBalance()
		);
	};

	// 获取按钮文本
	const getButtonText = () => {
		if (isLoading) {
			return (
				<div className='flex items-center justify-center'>
					<div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
					{swapDirection === 'buy' ? 'Buying...' : 'Selling...'}
				</div>
			);
		}

		if (!amount || parseFloat(amount) <= 0) {
			return 'Enter Amount';
		}

		if (!checkSufficientBalance()) {
			return `Insufficient ${swapDirection === 'buy' ? 'ETH' : 'YDT'} Balance`;
		}

		if (!checkContractBalance()) {
			return 'Contract ETH Insufficient';
		}

		return `${swapDirection === 'buy' ? 'Buy' : 'Sell'} Tokens`;
	};

	// 获取当前输入代币信息
	const getInputTokenInfo = () => {
		if (swapDirection === 'buy') {
			return {
				symbol: 'ETH',
				balance: ethBalance
					? parseFloat(formatEther(ethBalance.value)).toFixed(4)
					: '0.0000',
				icon: (
					<div className='w-7 h-7 bg-gray-700 rounded-full flex items-center justify-center'>
						<span className='text-white text-sm font-bold'>Ξ</span>
					</div>
				),
			};
		} else {
			return {
				symbol: 'YDT',
				balance: ydtBalance
					? parseFloat(formatEther(ydtBalance)).toFixed(4)
					: '0.0000',
				icon: (
					<div className='w-7 h-7 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center'>
						<span className='text-white text-sm font-bold'>YD</span>
					</div>
				),
			};
		}
	};

	// 获取当前输出代币信息
	const getOutputTokenInfo = () => {
		if (swapDirection === 'buy') {
			return {
				symbol: 'YDT',
				balance: ydtBalance
					? parseFloat(formatEther(ydtBalance)).toFixed(4)
					: '0.0000',
				icon: (
					<div className='w-7 h-7 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center'>
						<span className='text-white text-sm font-bold'>YD</span>
					</div>
				),
			};
		} else {
			return {
				symbol: 'ETH',
				balance: ethBalance
					? parseFloat(formatEther(ethBalance.value)).toFixed(4)
					: '0.0000',
				icon: (
					<div className='w-7 h-7 bg-gray-700 rounded-full flex items-center justify-center'>
						<span className='text-white text-sm font-bold'>Ξ</span>
					</div>
				),
			};
		}
	};

	const inputToken = getInputTokenInfo();
	const outputToken = getOutputTokenInfo();

	if (!isConnected) {
		return (
			<div className='min-h-screen flex justify-center p-4'>
				<div className='bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100'>
					<div className='w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6'>
						<svg
							className='w-10 h-10 text-white'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M13 10V3L4 14h7v7l9-11h-7z'
							/>
						</svg>
					</div>
					<h2 className='text-2xl font-bold text-gray-900 mb-4'>连接钱包</h2>
					<p className='text-gray-600 mb-8'>连接您的钱包开始交换 YD Token</p>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gray-50 flex justify-center p-4'>
			<div className='w-full max-w-md'>
				{/* 头部 */}
				<div className='text-center mb-6'>
					<h1 className='text-2xl font-bold text-gray-900 mb-2'>Token Swap</h1>
					<p className='text-gray-500'>Trade tokens in an instant</p>
				</div>

				{/* 合约状态信息 */}
				<div className='bg-blue-50 rounded-lg p-3 mb-4'>
					<div className='text-sm text-blue-700'>
						<div className='flex justify-between mb-1'>
							<span>Contract ETH Balance:</span>
							<span className='font-semibold'>
								{contractEthBalance
									? `${parseFloat(formatEther(contractEthBalance)).toFixed(4)} ETH`
									: 'Loading...'}
							</span>
						</div>
						<div className='flex justify-between'>
							<span>Exchange Rate:</span>
							<span className='font-semibold'>
								1 ETH ={' '}
								{exchangeRate ? Number(exchangeRate).toLocaleString() : '2,500'}{' '}
								YDT
							</span>
						</div>
					</div>
				</div>

				{/* 主表单 */}
				<form
					onSubmit={handleSwap}
					className='bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden'
				>
					<div className='p-6 space-y-1'>
						{/* From Token */}
						<div className='space-y-2'>
							<div className='flex justify-between items-center'>
								<label className='text-sm font-medium text-gray-700'>
									From
								</label>
								<span className='text-xs text-gray-500'>
									Balance: {inputToken.balance} {inputToken.symbol}
								</span>
							</div>

							<div className='relative bg-gray-50 rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-colors'>
								<div className='flex items-center justify-between'>
									<input
										type='number'
										step='0.000001'
										placeholder='0.0'
										value={amount}
										onChange={(e) => setAmount(e.target.value)}
										className='bg-transparent text-3xl font-bold placeholder-gray-400 border-none outline-none w-0 flex-1 min-w-0'
									/>
									<div className='flex items-center space-x-3 ml-4'>
										<button
											type='button'
											onClick={setMaxAmount}
											className='text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap'
										>
											MAX
										</button>
										<div className='flex items-center space-x-2 bg-white px-4 py-2.5 rounded-full border border-gray-200 shadow-sm'>
											{inputToken.icon}
											<span className='font-bold text-gray-900 text-lg'>
												{inputToken.symbol}
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* 交换箭头 */}
						<div className='flex items-center justify-center py-1'>
							<button
								type='button'
								onClick={toggleSwapDirection}
								className='bg-white border-4 border-gray-50 rounded-xl p-2 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-gray-50'
							>
								<svg
									className='w-5 h-5 text-gray-400'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M19 14l-7 7m0 0l-7-7m7 7V3'
									/>
								</svg>
							</button>
						</div>

						{/* To Token */}
						<div className='space-y-2'>
							<div className='flex justify-between items-center'>
								<label className='text-sm font-medium text-gray-700'>To</label>
								<span className='text-xs text-gray-500'>
									Balance: {outputToken.balance} {outputToken.symbol}
								</span>
							</div>

							<div className='relative bg-gray-50 rounded-xl border border-gray-200 p-4'>
								<div className='flex items-center justify-between'>
									<div className='text-3xl font-bold text-gray-900 w-0 flex-1 min-w-0'>
										{calculateOutputAmount()}
									</div>
									<div className='flex items-center space-x-2 bg-white px-4 py-2.5 rounded-full border border-gray-200 shadow-sm ml-4'>
										{outputToken.icon}
										<span className='font-bold text-gray-900 text-lg'>
											{outputToken.symbol}
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* 交易详情 */}
						{swapDirection === 'sell' && sellQuoteData && (
							<div className='bg-yellow-50 rounded-lg p-3 mt-4'>
								<div className='text-sm text-yellow-800'>
									<div className='flex justify-between mb-1'>
										<span>You will receive:</span>
										<span className='font-semibold'>
											{formatEther(sellQuoteData[0])} ETH
										</span>
									</div>
									<div className='flex justify-between mb-1'>
										<span>Fee ({sellFeePercentage}%):</span>
										<span className='font-semibold'>
											{formatEther(sellQuoteData[1])} ETH
										</span>
									</div>
								</div>
							</div>
						)}
					</div>

					{/* 提交按钮 */}
					<div className='p-6 pt-0'>
						<button
							type='submit'
							disabled={isButtonDisabled()}
							className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
								isButtonDisabled()
									? 'bg-gray-200 text-gray-400 cursor-not-allowed'
									: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
							}`}
						>
							{getButtonText()}
						</button>
					</div>
				</form>

				{/* 底部说明 */}
				<div className='mt-4 text-center'>
					<p className='text-xs text-gray-500'>
						By swapping, you agree to our Terms of Service and Privacy Policy
					</p>
				</div>
			</div>
		</div>
	);
};

export default TokenSwapForm;
