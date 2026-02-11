import React, { useMemo } from 'react';
import { useTasks } from '../hooks/useTasks';
import {
    subDays,
    eachDayOfInterval,
    format,
    getDay
} from 'date-fns';
import { Activity } from 'lucide-react';
import styles from './Heatmap.module.css';

export const Heatmap: React.FC = () => {
    const { tasks } = useTasks();

    // Generate last 365 days or ~6 months
    const days = useMemo(() => {
        const today = new Date();
        const start = subDays(today, 364); // 1 year
        return eachDayOfInterval({ start, end: today });
    }, []);

    const contributionData = useMemo(() => {
        const data: Record<string, number> = {};
        tasks.forEach(task => {
            // Check both completion time or just due date if we want "planned vs done"?
            // Prompt says "Consistency View" -> likely completions.
            // We tracked `completedAt`.
            if (task.isCompleted && task.completedAt) {
                const key = format(new Date(task.completedAt), 'yyyy-MM-dd');
                data[key] = (data[key] || 0) + 1;
            }
        });
        return data;
    }, [tasks]);

    const getIntensity = (count: number) => {
        if (count === 0) return 0;
        if (count <= 2) return 1;
        if (count <= 4) return 2;
        if (count <= 6) return 3;
        return 4;
    };

    // Group by weeks for the grid, ensuring alignment
    const weeks = useMemo(() => {
        const weeksArray: (Date | null)[][] = [];
        let currentWeek: (Date | null)[] = [];

        // Pad first week if needed
        // date-fns getDay returns 0 for Sunday.
        // We want Mon=0, Sun=6 for array index.
        const startDay = getDay(days[0]); // 0=Sun, 1=Mon...6=Sat
        // Adjust: Mon(1)->0, ... Sun(0)->6
        const dayIndex = startDay === 0 ? 6 : startDay - 1;

        for (let i = 0; i < dayIndex; i++) {
            currentWeek.push(null);
        }

        days.forEach(day => {
            currentWeek.push(day);
            if (currentWeek.length === 7) {
                weeksArray.push(currentWeek);
                currentWeek = [];
            }
        });

        // Pad last week
        if (currentWeek.length > 0) {
            while (currentWeek.length < 7) {
                currentWeek.push(null);
            }
            weeksArray.push(currentWeek);
        }

        return weeksArray;
    }, [days]);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Aktivität</h1>
                <p className={styles.subtitle}>Deine Konsistenz im Überblick</p>
            </header>

            <div className={styles.stats}>
                <div className={styles.statCard}>
                    <Activity className={styles.icon} />
                    <span className={styles.statValue}>
                        {tasks.filter(t => t.isCompleted).length}
                    </span>
                    <span className={styles.statLabel}>Erledigt</span>
                </div>

                {/* Top Icons / Activities */}
                {useMemo(() => {
                    const iconCounts: Record<string, number> = {};
                    tasks.filter(t => t.isCompleted && t.icon).forEach(t => {
                        iconCounts[t.icon!] = (iconCounts[t.icon!] || 0) + 1;
                    });
                    const topIcons = Object.entries(iconCounts)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 3);

                    return topIcons.length > 0 && (
                        <div className={styles.topActivities}>
                            {topIcons.map(([icon, count]) => (
                                <div key={icon} className={styles.activityBadge}>
                                    <span className={styles.badgeIcon}>{icon}</span>
                                    <span className={styles.badgeCount}>{count}x</span>
                                </div>
                            ))}
                        </div>
                    );
                }, [tasks])}
            </div>

            <div className={styles.graphContainer}>
                <div className={styles.graph}>
                    {weeks.map((week, i) => (
                        <div key={i} className={styles.column}>
                            {week.map((day, dIndex) => {
                                if (!day) return <div key={`empty-${dIndex}`} className={styles.cell} style={{ opacity: 0 }} />;

                                const key = format(day, 'yyyy-MM-dd');
                                const count = contributionData[key] || 0;
                                const intent = getIntensity(count);

                                return (
                                    <div
                                        key={key}
                                        className={styles.cell}
                                        data-intensity={intent}
                                        title={`${format(day, 'd. MMM')}: ${count} Aufgaben`}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            <p className={styles.footer}>
                Tippe auf eine Zelle für Details (WIP)
            </p>
        </div>
    );
};
