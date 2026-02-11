import React from 'react';
import { useNotification, type Toast as ToastType } from '../../context/NotificationContext';
import styles from './Toast.module.css';

const Toast: React.FC<{ toast: ToastType }> = ({ toast }) => {
    const { removeToast } = useNotification();

    return (
        <div
            className={`${styles.toast} ${styles[toast.type]}`}
            onClick={() => removeToast(toast.id)}
        >
            <div className={styles.content}>
                {toast.message}
            </div>
            <button className={styles.close}>×</button>
        </div>
    );
};

export const ToastContainer: React.FC = () => {
    const { toasts } = useNotification();

    return (
        <div className={styles.container}>
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} />
            ))}
        </div>
    );
};
