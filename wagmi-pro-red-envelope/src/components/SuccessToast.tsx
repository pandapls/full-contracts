interface SuccessToastProps {
    show: boolean
}

const SuccessToast: React.FC<SuccessToastProps> = ({ show }) => {
    if (!show) return null

    return (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            <div className="flex items-center">
                <div className="text-xl mr-2">✅</div>
                <div>交易成功！</div>
            </div>
        </div>
    )
}

export default SuccessToast
