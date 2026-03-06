import React from 'react';
import { NavLink } from 'react-router-dom';
import { List, Calendar, Activity, Settings } from 'lucide-react';
import clsx from 'clsx';
import styles from './TabBar.module.css';
import { useHaptics } from '../hooks/useHaptics';

export const TabBar: React.FC = () => {
    const haptics = useHaptics();

    return (
        <nav className={clsx(styles.tabBar, 'glass')}>
            <NavLink
                to="/"
                className={({ isActive }) => clsx(styles.tabItem, isActive && styles.active)}
                onClick={() => haptics.light()}
            >
                <List size={22} />
                <span className={styles.label}>Heute</span>
            </NavLink>

            <NavLink
                to="/calendar"
                className={({ isActive }) => clsx(styles.tabItem, isActive && styles.active)}
                onClick={() => haptics.light()}
            >
                <Calendar size={22} />
                <span className={styles.label}>Plan</span>
            </NavLink>

            <NavLink
                to="/heatmap"
                className={({ isActive }) => clsx(styles.tabItem, isActive && styles.active)}
                onClick={() => haptics.light()}
            >
                <Activity size={22} />
                <span className={styles.label}>Aktivität</span>
            </NavLink>

            <NavLink
                to="/settings"
                className={({ isActive }) => clsx(styles.tabItem, isActive && styles.active)}
                onClick={() => haptics.light()}
            >
                <Settings size={22} />
                <span className={styles.label}>Einstellungen</span>
            </NavLink>
        </nav>
    );
};
