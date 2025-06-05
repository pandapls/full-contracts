'use client'

import { RED_ENVELPOE_CONTRACT_ADDRESS, RED_ENVELPOE_CONTRACT_ADDRESS_ABI } from "@/constants/contract";
import { useRead } from "@/hooks/uesEthersContract";
import { useWallet } from "@/hooks/useEthersWallet";
import { useEffect, useState } from "react";

const ContractContent = () => {
    // ✅ 始终在顶层调用所有 hooks
    const { account, provider, isConnected } = useWallet();
    const [displayData, setDisplayData] = useState<string[] | null>(null);
    const [hasLogged, setHasLogged] = useState(false);

    // ✅ 始终调用 useRead，但通过 enabled 参数控制是否执行
    const { data: allGrabbers, loading, error } = useRead({
        address: RED_ENVELPOE_CONTRACT_ADDRESS,
        abi: RED_ENVELPOE_CONTRACT_ADDRESS_ABI,
        functionName: 'getAllGrabbers',
        enabled: isConnected && !!provider, // 通过 enabled 控制而不是条件渲染
    });

    // ✅ 始终调用 useEffect
    useEffect(() => {
        if (allGrabbers && !hasLogged) {
            const normalArray: string[] = Array.from(allGrabbers);
            console.log('Final result:', normalArray);
            setDisplayData(normalArray);
            setHasLogged(true);
        }
    }, [allGrabbers, hasLogged]);

    // ✅ 在 hooks 调用完成后再进行条件判断
    if (!isConnected || !provider) {
        return <div>请先连接钱包</div>;
    }

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;
    console.log('----')
    return (
        <div>
            <h3>All Grabbers ({displayData?.length || 0})</h3>
            {displayData?.map((address: string, index: number) => (
                <div key={address}>
                    {index + 1}: {address}
                </div>
            ))}
        </div>
    );
};

export default ContractContent;