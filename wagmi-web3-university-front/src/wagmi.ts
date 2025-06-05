import { http, cookieStorage, createConfig, createStorage } from 'wagmi'
import { Chain, sepolia } from 'wagmi/chains'
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors'
// 定义本地 Ganache 链
const ganache: Chain = {
  id: 1337, // 网络 ID，从截图中获取
  name: 'Ganache Local',
  nativeCurrency: {
    name: 'YDToken',
    symbol: 'YDT',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:7545'], // Ganache 的 RPC 地址，从截图中获取
    },
    public: {
      http: ['http://127.0.0.1:7545'],
    },
  },
  blockExplorers: {
    default: { name: 'Ganache Explorer', url: '' }, // 本地链没有区块浏览器
  },
  testnet: true, // 表示这是一个测试网络
};
export function getConfig() {
  return createConfig({
		chains: [sepolia, ganache],
		transports: {
			[sepolia.id]: http(
				`https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`
			),
			[ganache.id]: http('http://127.0.0.1:7545'),
		},
		connectors: [injected()],
		storage: createStorage({
			storage: cookieStorage,
		}),
		ssr: true,
	});
}

declare module 'wagmi' {
  interface Register {
    config: ReturnType<typeof getConfig>
  }
}
