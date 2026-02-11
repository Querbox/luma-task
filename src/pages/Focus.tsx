import React, { useMemo } from 'react';
import { useTasks } from '../hooks/useTasks';
import { TaskItem } from '../components/TaskItem';
import { TaskInput } from '../components/TaskInput';
import { isToday, isPast, addDays, isWithinInterval, startOfDay } from 'date-fns';
import { AnimatePresence } from 'framer-motion';
import styles from './Focus.module.css';

export const Focus: React.FC = () => {
    const { tasks, addTask, toggleTask, deleteTask, loading, setSelectedTaskId } = useTasks();

    const groups = useMemo(() => {
        const today = startOfDay(new Date());
        const nextWeek = addDays(today, 7);

        const todayGroup = [];
        const soonGroup = [];
        const laterGroup = [];

        // Sort by due date
        const sortedTasks = [...tasks].sort((a, b) => {
            // Put completed at bottom? Or hide? 
            // Usually Focus view hides completed or moves to bottom.
            if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
            // Date sort
            const dateA = a.dueDate || Infinity; // No date = end of list? or beginning?
            const dateB = b.dueDate || Infinity;
            return dateA - dateB;
        });

        for (const task of sortedTasks) {
            if (task.isCompleted) {
                // Option: Show completed in a separate "Done" list at bottom or just keep in date group?
                // Let's keep them in their groups for context, but styled differently
            }

            if (!task.dueDate) {
                todayGroup.push(task); // No date = Today/Inbox
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
        return <div className={styles.loading}>Lade Aufgaben...</div>;
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Heute</h1>
                <p className={styles.subtitle}>{new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </header>

            <div className={styles.list}>
                {/* Today Section */}
                <section>
                    {groups.todayGroup.length > 0 ? (
                        <AnimatePresence>
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

                {/* Soon Section */}
                {groups.soonGroup.length > 0 && (
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Demnächst</h2>
                        <AnimatePresence>
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

                {/* Later Section - Collapsible? For now just list */}
                {groups.laterGroup.length > 0 && (
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Später</h2>
                        <AnimatePresence>
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

                {/* Spacer for FAB/Input */}
                <div style={{ height: '80px' }} />
            </div>

            <TaskInput onAddTask={addTask} />
        </div>
    );
};
