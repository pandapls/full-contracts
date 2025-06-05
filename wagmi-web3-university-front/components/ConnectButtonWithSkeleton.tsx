'use client'

import { ConnectKitButton } from 'connectkit'
import { useEffect, useState } from 'react'

const ConnectButtonWithSkeleton = () => {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const baseStyle =
        'relative px-4 py-2 rounded-xl border border-black bg-white text-black text-base font-medium shadow-[4px_4px_0_0_black] transition-all duration-200'

    if (!mounted) {
        return (
            <div
                className={`${baseStyle} w-[160px] h-[40px] animate-pulse text-white`}
            >
                Loading
            </div>
        )
    }

    return (
        <ConnectKitButton.Custom>
            {({ isConnected, isConnecting, show, address, truncatedAddress }) => {
                if (isConnecting) {
                    return (
                        <div
                            className={`${baseStyle} w-[160px] h-[40px] animate-pulse text-white`}
                        >
                            Connecting
                        </div>
                    )
                }

                return (
                    <button onClick={show} className={`${baseStyle} w-[160px] h-[40px] cursor-pointer`}>
                        {isConnected ? truncatedAddress : 'Connect Wallet'}
                    </button>
                )
            }}
        </ConnectKitButton.Custom>
    )
}

export default ConnectButtonWithSkeleton
