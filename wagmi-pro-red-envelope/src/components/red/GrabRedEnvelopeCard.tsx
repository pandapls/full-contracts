import { GrabInfo } from "@/types/contract"

interface GrabRedEnvelopeCardProps {
    redOwner?: string
    userGrabInfo?: GrabInfo
    onGrab: () => void
    isLoading: boolean
    isConfirming: boolean
}

const GrabRedEnvelopeCard: React.FC<GrabRedEnvelopeCardProps> = ({
    redOwner,
    userGrabInfo,
    onGrab,
    isLoading,
    isConfirming
}) => {
    const hasUserGrabbed = userGrabInfo?.hasGrabbed

    return (
        <div className="text-center">
            <div className="text-6xl mb-4">🧧</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">有红包可以抢！</h2>
            <p className="text-gray-600 mb-6">
                发红包的人: {redOwner}
            </p>

            {!hasUserGrabbed ? (
                <button
                    onClick={onGrab}
                    disabled={isLoading || isConfirming}
                    className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-bold py-4 px-8 rounded-full text-xl transition duration-200 transform hover:scale-105"
                >
                    {isLoading ? '签名中...' : isConfirming ? '抢夺中...' : '🎯 抢红包'}
                </button>
            ) : (
                <div className="text-gray-500">
                    您已经抢过红包了 😊
                </div>
            )}
        </div>
    )
}

export default GrabRedEnvelopeCard

