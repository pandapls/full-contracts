import { ethers, BrowserProvider } from 'ethers';
import { useEffect, useState, useCallback } from 'react';
// const localUrl = 'http://localhost:7545';
const CONNECTED_KEY = 'wallet_connected';
export const useWallet = () => {
	const [signer, setSigner] = useState<ethers.Signer | null>(null);
	const [provider, setProvider] = useState<ethers.Provider | null>(null);
	const [account, setAccount] = useState<string | null>(null);
	const [network, setNetwork] = useState<ethers.Network | null>(null);
	const [isConnecting, setIsConnecting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isInitializing, setIsInitializing] = useState(true); // 新增：初始化状态

	const initWallet = useCallback(async () => {
		if (!window.ethereum) {
			setIsInitializing(false);
			return;
		}

		try {
			const provider = new BrowserProvider(window.ethereum);
			// 检查是否已经连接
			const accounts = await provider.send('eth_accounts', []); // 使	// 检查之前是否连接过

			if (accounts.length > 0 && localStorage.getItem(CONNECTED_KEY) === '1') {
				const signer = await provider.getSigner();
				const network = await provider.getNetwork();

				setProvider(provider);
				setSigner(signer);
				setAccount(accounts[0]);
				setNetwork(network);
			}
		} catch (err) {
			setError((error as unknown as Error).message);
		} finally {
			setIsInitializing(false);
		}
	}, []);

	useEffect(() => {
		initWallet();
	}, [initWallet]);

	const connectWallet = useCallback(async () => {
		if (!window.ethereum) {
			alert('请安装 MetaMask');
			return;
		}

		try {
			setIsConnecting(true);
			if (window.ethereum === null) {
				setProvider(ethers.getDefaultProvider());
			} else {
				// const provider = new ethers.JsonRpcProvider(localUrl);
				const provider = new BrowserProvider(window.ethereum);
				await provider.send('wallet_requestPermissions', [
					{ eth_accounts: {} },
				]);
				const accounts = await provider.send('eth_requestAccounts', []);
				const signer = await provider.getSigner();
				const network = await provider.getNetwork();
				setProvider(provider);
				setSigner(signer);
				setAccount(accounts[0]);
				setNetwork(network);
				localStorage.setItem(CONNECTED_KEY, '1'); // ✅ 标记连接状态
			}
		} catch (error) {
			setError((error as Error).message);
		} finally {
			setIsConnecting(false);
		}
	}, []);
	const disconnect = useCallback(() => {
		setProvider(null);
		setSigner(null);
		setAccount(null);
		setNetwork(null);
		setError(null);
		localStorage.removeItem(CONNECTED_KEY); // ✅ 清除连接标记
	}, []);

	useEffect(() => {
		if (!window.ethereum) {
			return;
		}

		const handleAccountsChanged = async (accounts: string[]) => {
			if (accounts.length === 0) {
				disconnect();
			} else {
				if (accounts[0] !== account) {
					try {
						const provider = new BrowserProvider(window.ethereum);
						const signer = await provider.getSigner();
						const network = await provider.getNetwork();
						setAccount(accounts[0]);
						setSigner(signer);
						setProvider(provider);
						setNetwork(network);
					} catch (error) {
						setError((error as unknown as Error).message);
					}
				}
			}
		};

		const handleChainChanged = () => {
			initWallet();
		};

		const addListener = (event: string, handler: any) => {
			if (window.ethereum.on) {
				window.ethereum.on(event, handler);
			} else if (window.ethereum.addEventListener) {
				window.ethereum.addEventListener(event, handler);
			}
		};

		const removeListener = (event: string, handler: any) => {
			if (window.ethereum.removeListener) {
				window.ethereum.removeListener(event, handler);
			} else if (window.ethereum.removeEventListener) {
				window.ethereum.removeEventListener(event, handler);
			}
		};
		const handleDisconnect = () => {
			disconnect();
		};

		// 添加事件监听
		addListener('accountsChanged', handleAccountsChanged);
		addListener('chainChanged', handleChainChanged);
		addListener('disconnect', handleDisconnect);

		// 清理函数
		return () => {
			removeListener('accountsChanged', handleAccountsChanged);
			removeListener('chainChanged', handleChainChanged);
			removeListener('disconnect', handleDisconnect);
		};
	}, [disconnect, account, initWallet]);

	return {
		provider,
		signer,
		account,
		isConnecting,
		isInitializing,
		isConnected: !!account,

		connectWallet,
		disconnect,
	};
};
