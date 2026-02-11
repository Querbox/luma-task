import React from 'react';
import { NavLink } from 'react-router-dom';
import { List, Calendar, Activity } from 'lucide-react';
import clsx from 'clsx';
import styles from './TabBar.module.css';

export const TabBar: React.FC = () => {
    return (
        <nav className={clsx(styles.tabBar, 'glass')}>
            <NavLink
                to="/"
                className={({ isActive }) => clsx(styles.tabItem, isActive && styles.active)}
            >
                <List size={24} />
                <span className={styles.label}>Focus</span>
            </NavLink>

            <NavLink
                to="/calendar"
                className={({ isActive }) => clsx(styles.tabItem, isActive && styles.active)}
            >
                <Calendar size={24} />
                <span className={styles.label}>Kalender</span>
            </NavLink>

            <NavLink
                to="/heatmap"
                className={({ isActive }) => clsx(styles.tabItem, isActive && styles.active)}
            >
                <Activity size={24} />
                <span className={styles.label}>Aktivität</span>
            </NavLink>
        </nav>
    );
};
