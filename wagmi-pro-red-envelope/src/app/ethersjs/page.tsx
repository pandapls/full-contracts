'use client';

import { useWallet } from '@/hooks/useEthersWallet';
import ContractContent from './contractContent';

function App() {
    const {
        connectWallet,
        provider,
        signer,
        account,
        isConnecting,
        isConnected,
        isInitializing,
        disconnect
    } = useWallet();

    if (isInitializing) {
        return <div>检查钱包连接状态...</div>
    }
    console.log('+++')
    return (
        <>
            {isConnected ? (
                <div className='flex'>
                    钱包: {account}
                    <button
                        className='btn bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed'
                        onClick={disconnect}
                    >
                        断开钱包
                    </button>
                </div>
            ) : (
                <div className='p-4'>
                    <button
                        className='btn bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed'
                        onClick={connectWallet}
                        disabled={isConnecting}
                    >
                        {isConnecting ? (
                            <svg className='animate-spin h-5 w-5 mr-2' viewBox='0 0 24 24'>
                                <circle
                                    className='opacity-25'
                                    cx='12'
                                    cy='12'
                                    r='10'
                                    stroke='currentColor'
                                    strokeWidth='4'
                                />
                                <path
                                    className='opacity-75'
                                    fill='currentColor'
                                    d='M4 12a8 8 0 018-8v8z'
                                />
                            </svg>
                        ) : null}
                        {isConnecting ? '连接中...' : '连接钱包'}
                    </button>
                </div>
            )}

            {/* 只在钱包连接且有 provider 时才渲染合约内容 */}
            {isConnected && provider && (
                <div>
                    <h1>合约操作：</h1>
                    <ContractContent />
                </div>
            )}
        </>
    );
}

export default App;