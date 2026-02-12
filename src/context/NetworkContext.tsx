import React, { createContext, useContext, useState, useEffect } from 'react';

interface NetworkContextType {
    isOnline: boolean;
    isSlowConnection: boolean;
    connectionType: string;
    effectiveType: '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isSlowConnection, setIsSlowConnection] = useState(false);
    const [connectionType, setConnectionType] = useState('unknown');
    const [effectiveType, setEffectiveType] = useState<'4g' | '3g' | '2g' | 'slow-2g' | 'unknown'>('unknown');

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

        if (!connection) {
            return;
        }

        const updateConnectionStatus = () => {
            setConnectionType(connection.type || 'unknown');
            setEffectiveType(connection.effectiveType || 'unknown');
            // Consider 2g and slow-2g as slow connections
            setIsSlowConnection(
                connection.effectiveType === '2g' ||
                connection.effectiveType === 'slow-2g' ||
                (connection.saveData === true) // Data saver mode
            );
        };

        updateConnectionStatus();

        connection.addEventListener('change', updateConnectionStatus);

        return () => {
            connection.removeEventListener('change', updateConnectionStatus);
        };
    }, []);

    return (
        <NetworkContext.Provider value={{ isOnline, isSlowConnection, connectionType, effectiveType }}>
            {children}
        </NetworkContext.Provider>
    );
};

export const useNetworkStatus = () => {
    const context = useContext(NetworkContext);
    if (!context) {
        throw new Error('useNetworkStatus must be used within a NetworkProvider');
    }
    return context;
};
