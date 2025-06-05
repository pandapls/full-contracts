'use client'
import {
    RainbowKitProvider,
} from '@rainbow-me/rainbowkit';

export function CustomRainbowKitProvider({ children }: { children: React.ReactNode }) {
    return (
        <RainbowKitProvider>{children}</RainbowKitProvider>
    )
}