import React, { createContext, useContext, useState, useCallback } from 'react';

export type ToastType = 'success' | 'info' | 'error' | 'warning';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface NotificationContextType {
    toasts: Toast[];
    showToast: (message: string, type?: ToastType) => void;
    removeToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto remove after 3 seconds
        setTimeout(() => {
            removeToast(id);
        }, 3600);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <NotificationContext.Provider value={{ toasts, showToast, removeToast }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
