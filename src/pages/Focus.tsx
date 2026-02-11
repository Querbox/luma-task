import React, { useMemo } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useNotifications } from '../hooks/useNotifications';
import { TaskItem } from '../components/TaskItem';
import { TaskInput } from '../components/TaskInput';
import { isToday, isPast, addDays, isWithinInterval, startOfDay } from 'date-fns';
import { AnimatePresence } from 'framer-motion';
import styles from './Focus.module.css';

export const Focus: React.FC = () => {
    const { tasks, addTask, toggleTask, deleteTask, loading, setSelectedTaskId } = useTasks();
    const { permission, requestPermission, isSupported } = useNotifications();



    const groups = useMemo(() => {
        const today = startOfDay(new Date());
        const nextWeek = addDays(today, 7);

        const todayGroup = [];
        const soonGroup = [];
        const laterGroup = [];

        const sortedTasks = [...tasks].sort((a, b) => {
            if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
            const dateA = a.dueDate || Infinity;
            const dateB = b.dueDate || Infinity;
            return dateA - dateB;
        });

        for (const task of sortedTasks) {
            if (!task.dueDate) {
                todayGroup.push(task);
            } else {
                const date = new Date(task.dueDate);
                if (isPast(date) || isToday(date)) {
                    todayGroup.push(task);
                } else if (isWithinInterval(date, { start: addDays(today, 1), end: nextWeek })) {
                    soonGroup.push(task);
                } else {
                    laterGroup.push(task);
                }
            }
        }

        return { todayGroup, soonGroup, laterGroup };
    }, [tasks]);

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.loadingDots}>
                    <span>●</span>
                    <span>●</span>
                    <span>●</span>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Heute</h1>
                    <p className={styles.subtitle}>{new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
                {isSupported && permission !== 'granted' && (
                    <button
                        className={styles.notificationButton}
                        onClick={requestPermission}
                        title="Benachrichtigungen aktivieren"
                    >
                        <span>🔔 Aktivieren</span>
                    </button>
                )}
            </header>

            <div className={styles.list}>
                <section className={styles.section}>
                    {groups.todayGroup.length > 0 ? (
                        <AnimatePresence mode="popLayout">
                            {groups.todayGroup.map(task => (
                                <TaskItem
                                    key={task.id}
                                    task={task}
                                    onToggle={toggleTask}
                                    onDelete={deleteTask}
                                    onSelect={setSelectedTaskId}
                                />
                            ))}
                        </AnimatePresence>
                    ) : (
                        <div className={styles.emptyState}>
                            <p>Keine Aufgaben für heute.</p>
                        </div>
                    )}
                </section>

                {groups.soonGroup.length > 0 && (
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Demnächst</h2>
                        <AnimatePresence mode="popLayout">
                            {groups.soonGroup.map(task => (
                                <TaskItem
                                    key={task.id}
                                    task={task}
                                    onToggle={toggleTask}
                                    onDelete={deleteTask}
                                    onSelect={setSelectedTaskId}
                                />
                            ))}
                        </AnimatePresence>
                    </section>
                )}

                {groups.laterGroup.length > 0 && (
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Später</h2>
                        <AnimatePresence mode="popLayout">
                            {groups.laterGroup.map(task => (
                                <TaskItem
                                    key={task.id}
                                    task={task}
                                    onToggle={toggleTask}
                                    onDelete={deleteTask}
                                    onSelect={setSelectedTaskId}
                                />
                            ))}
                        </AnimatePresence>
                    </section>
                )}
            </div>

            <TaskInput onAddTask={addTask} />
        </div>
    );
};
