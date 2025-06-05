import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from "react";
import { Toast, ToastType } from "./Toast.type";

// Toast 图标映射
const toastIcons = {
    [ToastType.SUCCESS]: CheckCircle,
    [ToastType.ERROR]: AlertCircle,
    [ToastType.WARNING]: AlertTriangle,
    [ToastType.INFO]: Info,
};

// Toast 样式映射
const toastStyles = {
    [ToastType.SUCCESS]: 'bg-green-50 border-green-200 text-green-800',
    [ToastType.ERROR]: 'bg-red-50 border-red-200 text-red-800',
    [ToastType.WARNING]: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    [ToastType.INFO]: 'bg-blue-50 border-blue-200 text-blue-800',
};

const iconStyles = {
    [ToastType.SUCCESS]: 'text-green-500',
    [ToastType.ERROR]: 'text-red-500',
    [ToastType.WARNING]: 'text-yellow-500',
    [ToastType.INFO]: 'text-blue-500',
};
export const ToastItem: React.FC<{
    toast: Toast;
    onRemove: (id: string) => void;
}> = ({ toast, onRemove }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    const Icon = toastIcons[toast.type];

    useEffect(() => {
        // 入场动画
        const timer = setTimeout(() => setIsVisible(true), 50);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // 自动消失
        const duration = toast.duration || 4000;
        const timer = setTimeout(() => {
            handleRemove();
        }, duration);

        return () => clearTimeout(timer);
    }, [toast.duration]);

    const handleRemove = () => {
        setIsLeaving(true);
        setTimeout(() => {
            onRemove(toast.id);
        }, 300);
    };

    return (
        <div
            className={`
        flex items-center gap-3 p-4 mb-3 rounded-lg border shadow-lg backdrop-blur-sm
        transition-all duration-300 ease-out transform
        ${toastStyles[toast.type]}
        ${isVisible && !isLeaving
                    ? 'translate-x-0 opacity-100'
                    : isLeaving
                        ? 'translate-x-full opacity-0'
                        : 'translate-x-full opacity-0'
                }
      `}
            style={{
                minWidth: '320px',
                maxWidth: '400px',
            }}
        >
            <Icon className={`w-5 h-5 flex-shrink-0 ${iconStyles[toast.type]}`} />
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
                onClick={handleRemove}
                className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};
