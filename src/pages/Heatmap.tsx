import React, { useMemo } from 'react';
import { useTasks } from '../hooks/useTasks';
import {
    subDays,
    eachDayOfInterval,
    format,
    getDay
} from 'date-fns';
import { Activity, Flame, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './Heatmap.module.css';

export const Heatmap: React.FC = () => {
    const { tasks } = useTasks();

    const days = useMemo(() => {
        const today = new Date();
        const start = subDays(today, 364);
        return eachDayOfInterval({ start, end: today });
    }, []);

    const contributionData = useMemo(() => {
        const data: Record<string, number> = {};
        tasks.forEach(task => {
            if (task.isCompleted && task.completedAt) {
                const key = format(new Date(task.completedAt), 'yyyy-MM-dd');
                data[key] = (data[key] || 0) + 1;
            }
        });
        return data;
    }, [tasks]);

    const streaks = useMemo(() => {
        let currentStreak = 0;
        let today = new Date();

        // Loop backwards from yesterday/today
        for (let i = 0; i < 365; i++) {
            const date = subDays(today, i);
            const key = format(date, 'yyyy-MM-dd');
            if (contributionData[key]) {
                currentStreak++;
            } else if (i > 0) { // Allow today to be empty without breaking streak yet
                break;
            }
        }
        return { currentStreak };
    }, [contributionData]);

    const getIntensity = (count: number) => {
        if (count === 0) return 0;
        if (count <= 2) return 1;
        if (count <= 4) return 2;
        if (count <= 6) return 3;
        return 4;
    };

    const weeks = useMemo(() => {
        const weeksArray: (Date | null)[][] = [];
        let currentWeek: (Date | null)[] = [];
        const startDay = getDay(days[0]);
        const dayIndex = startDay === 0 ? 6 : startDay - 1;

        for (let i = 0; i < dayIndex; i++) currentWeek.push(null);

        days.forEach(day => {
            currentWeek.push(day);
            if (currentWeek.length === 7) {
                weeksArray.push(currentWeek);
                currentWeek = [];
            }
        });

        if (currentWeek.length > 0) {
            while (currentWeek.length < 7) currentWeek.push(null);
            weeksArray.push(currentWeek);
        }
        return weeksArray;
    }, [days]);

    return (
        <motion.div
            className={styles.container}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <header className={styles.header}>
                <h1 className={styles.title}>Aktivität</h1>
            </header>

            <div className={styles.statsGrid}>
                <div className={styles.statCard} style={{ background: 'rgba(255, 45, 85, 0.1)' }}>
                    <div className={styles.statHeader}>
                        <Activity size={16} color="#FF2D55" />
                        <span className={styles.statLabel}>Erledigt</span>
                    </div>
                    <span className={styles.statValue} style={{ color: '#FF2D55' }}>
                        {tasks.filter(t => t.isCompleted).length}
                    </span>
                </div>

                <div className={styles.statCard} style={{ background: 'rgba(255, 159, 10, 0.1)' }}>
                    <div className={styles.statHeader}>
                        <Flame size={16} color="#FF9F0A" />
                        <span className={styles.statLabel}>Streak</span>
                    </div>
                    <span className={styles.statValue} style={{ color: '#FF9F0A' }}>
                        {streaks.currentStreak}
                    </span>
                </div>
            </div>

            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <Calendar size={18} className={styles.cardIcon} />
                    <span className={styles.cardTitle}>Konsistenz</span>
                </div>
                <div className={styles.graphContainer}>
                    <div className={styles.graph}>
                        {weeks.map((week, i) => (
                            <div key={i} className={styles.column}>
                                {week.map((day, dIndex) => {
                                    if (!day) return <div key={`empty-${dIndex}`} className={styles.cell} style={{ opacity: 0 }} />;
                                    const key = format(day, 'yyyy-MM-dd');
                                    const count = contributionData[key] || 0;
                                    return (
                                        <div
                                            key={key}
                                            className={styles.cell}
                                            data-intensity={getIntensity(count)}
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Top Aktivitäten</h3>
                <div className={styles.card}>
                    {useMemo(() => {
                        const iconCounts: Record<string, number> = {};
                        tasks.filter(t => t.isCompleted && t.icon).forEach(t => {
                            iconCounts[t.icon!] = (iconCounts[t.icon!] || 0) + 1;
                        });
                        const topIcons = Object.entries(iconCounts)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 5);

                        return topIcons.length > 0 ? (
                            <div className={styles.activityList}>
                                {topIcons.map(([icon, count]) => (
                                    <div key={icon} className={styles.activityItem}>
                                        <span className={styles.activityIcon}>{icon}</span>
                                        <div className={styles.activityInfo}>
                                            <span className={styles.activityName}>Aktivität</span>
                                            <span className={styles.activityCount}>{count} Mal</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className={styles.emptyText}>Noch keine Aktivitäten aufgezeichnet.</p>
                        );
                    }, [tasks])}
                </div>
            </section>
        </motion.div>
    );
};
