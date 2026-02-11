import React from 'react';
import { motion, type PanInfo, useAnimation, AnimatePresence } from 'framer-motion';
import { format, isToday, isTomorrow } from 'date-fns';
import { de } from 'date-fns/locale';
import { Check, Trash2, Calendar } from 'lucide-react';
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

    const handleDragEnd = async (_event: any, info: PanInfo) => {
        if (info.offset.x > 80) {
            onToggle(task.id);
            await controls.start({ x: 0 });
        } else if (info.offset.x < -80) {
            onDelete(task.id);
            await controls.start({ x: 0 });
        } else {
            controls.start({ x: 0 });
        }
    };

    const formatDate = (timestamp?: number) => {
        if (!timestamp) return null;
        const date = new Date(timestamp);
        if (isToday(date)) return 'Heute';
        if (isTomorrow(date)) return 'Morgen';
        return format(date, 'eee, d. MMM', { locale: de });
    };

    return (
        <div className={styles.container}>
            <div className={clsx(styles.actionBackground, styles.completeAction)} style={{ opacity: 1 }}>
                <Check size={20} strokeWidth={2.5} />
            </div>
            <div className={clsx(styles.actionBackground, styles.deleteAction)} style={{ opacity: 1 }}>
                <Trash2 size={20} strokeWidth={2} />
            </div>

            <motion.div
                drag="x"
                dragConstraints={{ left: -100, right: 100 }}
                dragElastic={0.15}
                onDragEnd={handleDragEnd}
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

