import React from 'react';
import { useNetworkStatus } from '../context/NetworkContext';
import styles from './LoadingScreen.module.css';

export const LoadingScreen: React.FC = () => {
    const { isOnline, isSlowConnection, effectiveType } = useNetworkStatus();

    // Don't show if online with good connection
    if (isOnline && !isSlowConnection) {
        return null;
    }

    return (
        <div className={styles.overlay}>
            <div className={styles.container}>
                <div className={styles.spinner}></div>
                <h2 className={styles.title}>
                    {!isOnline ? 'Offline' : 'Langsame Verbindung'}
                </h2>
                <p className={styles.description}>
                    {!isOnline
                        ? 'Du bist derzeit offline. Einige Funktionen sind möglicherweise nicht verfügbar.'
                        : `${effectiveType !== 'unknown' ? `Verbindung: ${effectiveType.toUpperCase()}` : 'Langsame Verbindung erkannt'}`}
                </p>
                <div className={styles.dots}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    );
};
