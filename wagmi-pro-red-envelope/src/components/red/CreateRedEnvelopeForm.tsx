'use client'
import { useState, FormEvent } from 'react'

interface CreateRedEnvelopeFormProps {
    onSubmit: (amount: string, count: string, isEqual: boolean) => void
    onCancel?: () => void // 新增：取消回调
    isLoading: boolean
    isConfirming: boolean
    showCancelButton?: boolean // 新增：是否显示取消按钮
}

const CreateRedEnvelopeForm: React.FC<CreateRedEnvelopeFormProps> = ({
    onSubmit,
    onCancel,
    isLoading,
    isConfirming,
    showCancelButton = false
}) => {
    const [amount, setAmount] = useState<string>('')
    const [count, setCount] = useState<string>('')
    const [isEqual, setIsEqual] = useState<boolean>(false)
    const [showForm, setShowForm] = useState<boolean>(false)

    const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault()

        if (!amount || !count || parseFloat(amount) <= 0 || parseInt(count) <= 0) {
            alert('请填写有效的金额和数量')
            return
        }

        onSubmit(amount, count, isEqual)
        // 提交后重置表单
        setAmount('')
        setCount('')
        setIsEqual(false)
        setShowForm(false)
    }

    const handleCancel = () => {
        setShowForm(false)
        if (onCancel) {
            onCancel()
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">创建红包</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition duration-200"
                    >
                        {showForm ? '收起' : '发红包'}
                    </button>

                    {/* 显示取消按钮（用于从重置进入的情况） */}
                    {showCancelButton && !showForm && (
                        <button
                            onClick={handleCancel}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition duration-200"
                        >
                            返回
                        </button>
                    )}
                </div>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            红包总金额 (ETH)
                        </label>
                        <input
                            type="number"
                            step="0.001"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="例如: 0.1"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            红包个数
                        </label>
                        <input
                            type="number"
                            value={count}
                            onChange={(e) => setCount(e.target.value)}
                            placeholder="例如: 5"
                            min="1"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
                            required
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isEqual"
                            checked={isEqual}
                            onChange={(e) => setIsEqual(e.target.checked)}
                            className="mr-2 h-4 w-4 custom-checkbox cursor-pointer"
                        />
                        <label htmlFor="isEqual" className="text-sm font-medium text-gray-700">
                            平均分配 (否则随机分配)
                        </label>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={isLoading || isConfirming}
                            className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
                        >
                            {isLoading ? '签名中...' : isConfirming ? '创建中...' : `创建红包 (${amount || 0} ETH)`}
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
                        >
                            取消
                        </button>
                    </div>
                </form>
            )}
        </div>
    )
}

export default CreateRedEnvelopeForm