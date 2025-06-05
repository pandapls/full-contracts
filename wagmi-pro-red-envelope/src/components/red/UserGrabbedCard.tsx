import { GrabInfo } from '@/types/contract'
import { formatEther } from 'viem'

interface UserGrabbedCardProps {
    userGrabInfo?: GrabInfo
}

const UserGrabbedCard: React.FC<UserGrabbedCardProps> = ({ userGrabInfo }) => {
    const hasUserGrabbed = userGrabInfo?.hasGrabbed

    if (!hasUserGrabbed) return null

    return (
        <div className="bg-green-100 border border-green-400 rounded-2xl p-6 mb-6">
            <div className="text-center">
                <div className="text-4xl mb-2">🎉</div>
                <h2 className="text-2xl font-bold text-green-800 mb-2">恭喜您抢到红包！</h2>
                <div className="text-3xl font-bold text-green-600 mb-2">
                    {formatEther(userGrabInfo.amount)} ETH
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                    <div>第 {Number(userGrabInfo.grabIndex)} 个抢到</div>
                    <div>时间: {new Date(Number(userGrabInfo.grabTime) * 1000).toLocaleString()}</div>
                </div>
            </div>
        </div>
    )
}

export default UserGrabbedCard
