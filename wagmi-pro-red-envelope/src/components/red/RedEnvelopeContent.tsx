'use client'
import { useEffect, useState } from 'react'
import { Address } from 'viem'
import StatusCard from './StatusCard'
import UserGrabbedCard from './UserGrabbedCard'
import CreateRedEnvelopeForm from './CreateRedEnvelopeForm'
import GrabRedEnvelopeCard from './GrabRedEnvelopeCard'
import SuccessToast from '../SuccessToast'
import { useRedEnvelopeReads, useRedEnvelopeWrites } from '../../hooks/useRedEnvelopeContract'
import { useAccount } from 'wagmi'

const RedEnvelopeContent = () => {
    const { address } = useAccount()
    const contractReads = useRedEnvelopeReads(address)
    const contractWrites = useRedEnvelopeWrites()

    // 添加状态来控制是否显示创建表单
    const [showCreateForm, setShowCreateForm] = useState(false)

    const {
        totalAmount,
        redEnvelopeCount,
        remainingCount,
        isRedEnvelopeSet,
        userGrabInfo,
        redOwner,
        isEqualDistribution,
        allGrabbers,
        refreshData,
        contracBlance,
    } = contractReads

    const {
        createRedEnvelope,
        grabRedEnvelope,
        isSetPending,
        isSetConfirming,
        isSetSuccess,
        isGrabPending,
        isGrabConfirming,
        isGrabSuccess,
    } = contractWrites

    // 监听交易成功，刷新数据
    useEffect(() => {
        if (isSetSuccess || isGrabSuccess) {
            const timer = setTimeout(() => {
                refreshData()
            }, 100)
            return () => clearTimeout(timer)
        }
    }, [isSetSuccess, isGrabSuccess, refreshData])

    // 判断显示逻辑
    const isRedEnvelopeFinished = isRedEnvelopeSet && remainingCount !== undefined && Number(remainingCount) === 0
    const shouldShowCreateForm = !isRedEnvelopeSet || showCreateForm
    const shouldShowGrabCard = isRedEnvelopeSet && remainingCount !== undefined && Number(remainingCount) > 0 && !showCreateForm


    // 处理创建红包表单提交
    const handleCreateRedEnvelope = (amount: string, count: string, isEqual: boolean) => {
        createRedEnvelope(amount, count, isEqual)
        setShowCreateForm(false)
    }

    // 处理取消创建表单
    const handleCancelCreate = () => {
        setShowCreateForm(false)
    }

    // 调试信息
    console.log('Debug Info:', {
        isRedEnvelopeSet,
        remainingCount: remainingCount ? Number(remainingCount) : undefined,
        isRedEnvelopeFinished,
        shouldShowCreateForm,
        shouldShowGrabCard,
        showCreateForm
    })

    return (
        <div className="min-h-screen from-red-400 to-pink-600 p-4">
            <div className="max-w-4xl mx-auto">

                {/* 调试信息显示 */}
                {/* <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4 mb-4 text-sm text-red-800">
                    <strong>调试信息:</strong><br />
                    红包已设置: {isRedEnvelopeSet ? '是' : '否'}<br />
                    剩余数量: {remainingCount !== undefined ? Number(remainingCount) : '未定义'}<br />
                    红包已完成: {isRedEnvelopeFinished ? '是' : '否'}<br />
                    显示创建表单: {shouldShowCreateForm ? '是' : '否'}<br />
                    显示抢红包: {shouldShowGrabCard ? '是' : '否'}
                </div> */}

                <StatusCard
                    totalAmount={totalAmount}
                    redEnvelopeCount={redEnvelopeCount}
                    remainingCount={remainingCount}
                    isEqualDistribution={isEqualDistribution}
                    isRedEnvelopeSet={isRedEnvelopeSet}
                    contracBlance={contracBlance}
                    showResetButton={isRedEnvelopeFinished}
                />

                <UserGrabbedCard userGrabInfo={userGrabInfo} />

                {(shouldShowCreateForm || shouldShowGrabCard) && (
                    <div className="bg-white rounded-2xl shadow-2xl p-6">
                        {shouldShowCreateForm && (
                            <CreateRedEnvelopeForm
                                onSubmit={handleCreateRedEnvelope}
                                onCancel={handleCancelCreate}
                                isLoading={isSetPending}
                                isConfirming={isSetConfirming}
                                showCancelButton={isRedEnvelopeSet} // 只有在已有红包时才显示取消按钮
                            />
                        )}

                        {shouldShowGrabCard && (
                            <GrabRedEnvelopeCard
                                redOwner={redOwner}
                                userGrabInfo={userGrabInfo}
                                onGrab={grabRedEnvelope}
                                isLoading={isGrabPending}
                                isConfirming={isGrabConfirming}
                            />
                        )}
                    </div>
                )}

                {/* 显示抢红包历史 */}
                {allGrabbers && allGrabbers.length > 0 && !showCreateForm && (
                    <div className="bg-white rounded-2xl shadow-2xl p-6 mt-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">抢红包记录</h3>
                        <div className="space-y-2">
                            {allGrabbers.map((grabber, index) => (
                                <div key={grabber} className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600">
                                        第 {index + 1} 名: {grabber}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {grabber === address ? '(您)' : ''}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <SuccessToast show={isSetSuccess || isGrabSuccess} />
            </div>
        </div>
    )
}

export default RedEnvelopeContent