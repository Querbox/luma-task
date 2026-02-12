import React from 'react';
import { motion, type PanInfo, useAnimation, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { format, isToday, isTomorrow } from 'date-fns';
import { de } from 'date-fns/locale';
import { Check, Trash2, Calendar, Bell } from 'lucide-react';
import clsx from 'clsx';
import type { Task } from '../types';
import styles from './TaskItem.module.css';

interface TaskItemProps {
    task: Task;
    onToggle: (id: string, completed?: boolean) => void;
    onDelete: (id: string) => void;
    onSelect: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
    task,
    onToggle,
    onDelete,
    onSelect
}) => {
    const controls = useAnimation();
    const x = useMotionValue(0);

    // Derived values for backgrounds
    const completeOpacity = useTransform(x, [0, 60], [0, 1]);
    const deleteOpacity = useTransform(x, [0, -60], [0, 1]);

    const handleDragEnd = async (_event: any, info: PanInfo) => {
        if (info.offset.x > 80) {
            onToggle(task.id);
            await controls.start({ x: 0 });
        } else if (info.offset.x < -80) {
            if (window.confirm('Aufgabe wirklich löschen?')) {
                onDelete(task.id);
            }
            await controls.start({ x: 0 });
        } else {
            controls.start({ x: 0 });
        }
    };

    const formatDate = (timestamp?: number) => {
        if (!timestamp) return null;
        const date = new Date(timestamp);
        const timeStr = format(date, ' HH:mm');
        const displayTime = timeStr === ' 00:00' ? '' : timeStr;

        if (isToday(date)) return `Heute${displayTime}`;
        if (isTomorrow(date)) return `Morgen${displayTime}`;
        return format(date, `eee, d. MMM${displayTime}`, { locale: de });
    };

    return (
        <div className={styles.container}>
            <motion.div
                className={clsx(styles.actionBackground, styles.completeAction)}
                style={{ opacity: completeOpacity }}
            >
                <Check size={20} strokeWidth={2.5} />
            </motion.div>
            <motion.div
                className={clsx(styles.actionBackground, styles.deleteAction)}
                style={{ opacity: deleteOpacity }}
            >
                <Trash2 size={20} strokeWidth={2} />
            </motion.div>

            <motion.div
                drag="x"
                dragConstraints={{ left: -100, right: 100 }}
                dragElastic={0.15}
                onDragEnd={handleDragEnd}
                style={{ x }}
                animate={controls}
                className={clsx(styles.item, task.isCompleted && styles.completed)}
                onClick={() => onSelect(task.id)}
            >
                <button
                    className={clsx(styles.checkbox, task.isCompleted && styles.checked)}
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggle(task.id);
                    }}
                >
                    <AnimatePresence>
                        {task.isCompleted && (
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    lineHeight: 1
                                }}
                            >
                                <Check size={14} strokeWidth={3} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </button>

                <div className={styles.content}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {task.icon && <span className={styles.iconWrapper}>{task.icon}</span>}
                        <span className={styles.title}>{task.title}</span>
                    </div>

                    {(task.dueDate || (task.tags && task.tags.length > 0)) && (
                        <div className={styles.meta}>
                            {task.dueDate && (
                                <span className={clsx(
                                    styles.date,
                                    task.dueDate < Date.now() && !task.isCompleted && styles.overdue
                                )}>
                                    <Calendar size={12} />
                                    {formatDate(task.dueDate)}
                                </span>
                            )}
                            {task.hasReminder && (
                                <span className={styles.date} style={{ color: 'var(--color-warning)' }}>
                                    <Bell size={12} />
                                </span>
                            )}
                            {task.tags?.map(tag => (
                                <span key={tag} className={styles.tag}>{tag}</span>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

