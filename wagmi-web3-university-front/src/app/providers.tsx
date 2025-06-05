'use client';
import { State, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider } from "connectkit";
import { getConfig } from "@/wagmi";
import { ReactNode } from "react";

const queryClient = new QueryClient();
const config = getConfig();
export const Web3Provider = (props: {
  children: ReactNode
  initialState?: State
}) => {
  
  return (
    <WagmiProvider config={config} initialState={props.initialState}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider theme="retro">{props.children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
