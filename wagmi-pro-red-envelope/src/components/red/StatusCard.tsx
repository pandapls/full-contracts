import { formatBalance } from '@/utils'
import { formatEther } from 'viem'

interface StatusCardProps {
    totalAmount?: bigint
    redEnvelopeCount?: bigint
    remainingCount?: bigint
    isEqualDistribution?: boolean
    isRedEnvelopeSet?: boolean
    contracBlance?: bigint
    showResetButton?: boolean // 新增：控制是否显示重置按钮
}

const StatusCard: React.FC<StatusCardProps> = ({
    totalAmount,
    redEnvelopeCount,
    remainingCount,
    isEqualDistribution,
    isRedEnvelopeSet,
    contracBlance,
    showResetButton = false,
}) => {
    if (!isRedEnvelopeSet) return null

    return (
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 text-center">
                <div className="bg-red-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-red-600">
                        {totalAmount ? formatEther(totalAmount) : '0'} ETH
                    </div>
                    <div className="text-sm text-gray-600">总金额</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-red-600">
                        {contracBlance ? formatBalance(contracBlance) : '0'} ETH
                    </div>
                    <div className="text-sm text-gray-600">红包余额</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600">
                        {redEnvelopeCount ? Number(redEnvelopeCount) : 0}
                    </div>
                    <div className="text-sm text-gray-600">红包总数</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">
                        {remainingCount ? Number(remainingCount) : 0}
                    </div>
                    <div className="text-sm text-gray-600">剩余数量</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-600">
                        {isEqualDistribution ? '平均' : '随机'}
                    </div>
                    <div className="text-sm text-gray-600">分配方式</div>
                </div>

                {/* 如果红包没有被抢完，显示状态信息 */}
                {!showResetButton && (
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-gray-600">
                            {remainingCount !== undefined && Number(remainingCount) > 0 ? '🎯 进行中' : '🎉 已完成'}
                        </div>
                        <div className="text-sm text-gray-600">红包状态</div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default StatusCard