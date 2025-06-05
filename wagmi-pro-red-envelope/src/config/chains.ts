import type { Chain } from 'wagmi/chains';

export const ganacheChain = {
	id: 1337,
	name: 'Ganache',
	nativeCurrency: {
		decimals: 18,
		name: 'Ethereum',
		symbol: 'ETH',
	},
	rpcUrls: {
		default: { http: ['http://localhost:7545'] },
		public: { http: ['http://localhost:7545'] },
	},
	blockExplorers: {
		default: {
			name: 'Ganache Explorer',
			url: 'http://localhost:7545',
		},
	},
} as const satisfies Chain;
