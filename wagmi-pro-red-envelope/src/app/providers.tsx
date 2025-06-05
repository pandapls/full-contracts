'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode } from 'react'
import { type State, WagmiProvider } from 'wagmi'

import { wagmiConfig } from '@/wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
const queryClient = new QueryClient();
export function Providers(props: {
  children: ReactNode
  initialState?: State
}) {

  return (
    <WagmiProvider config={wagmiConfig} initialState={props.initialState}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{props.children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
