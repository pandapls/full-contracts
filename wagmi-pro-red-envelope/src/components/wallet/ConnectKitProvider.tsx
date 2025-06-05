'use client';
import { ConnectKitProvider as LibConnectKitProvider } from 'connectkit';

export function CustomConnectKitProvider({ children }: { children: React.ReactNode }) {
    return (
        <LibConnectKitProvider>
            {children}
        </LibConnectKitProvider>
    )
}