import React from 'react';
import { Outlet } from 'react-router-dom';
import { TabBar } from './TabBar';
import { useNotifications } from '../hooks/useNotifications';
import { TaskDetailModal } from './TaskDetailModal';
import { LoadingScreen } from './LoadingScreen';
import styles from './Layout.module.css';

export const Layout: React.FC = () => {
    useNotifications();
    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <Outlet />
            </main>
            <TabBar />
            <TaskDetailModal />
            <LoadingScreen />
        </div>
    );
};
