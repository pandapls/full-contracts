import { cookieStorage, createConfig, createStorage, http } from 'wagmi';
import { mainnet, sepolia, localhost } from 'wagmi/chains';
import type { Config } from 'wagmi';
export const chains = [mainnet, sepolia, localhost] as const;

export const wagmiConfig = createConfig({
	chains,
	ssr: true,
	storage: createStorage({
		storage: cookieStorage,
	}),
	transports: {
		[mainnet.id]: http(),
		[sepolia.id]: http(),
		[localhost.id]: http('http://localhost:7545'),
	},
}) as any;
