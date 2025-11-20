import { memo } from 'react'
import type { Toast } from '../hooks/useToast'

interface ToastNotificationProps {
    toasts: Toast[]
    onRemove: (id: string) => void
}

export const ToastNotification = memo(function ToastNotification({
    toasts,
    onRemove,
}: ToastNotificationProps) {
    if (!toasts.length) return null

    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`toast toast--${toast.type}`}
                    onClick={() => onRemove(toast.id)}
                >
                    <span className="toast__icon">
                        {toast.type === 'success' && '✅'}
                        {toast.type === 'error' && '❌'}
                        {toast.type === 'info' && 'ℹ️'}
                    </span>
                    <span className="toast__message">{toast.message}</span>
                </div>
            ))}
        </div>
    )
})

export default ToastNotification
