import React from 'react';
import { motion, type PanInfo, useAnimation } from 'framer-motion';
import { format, isToday, isTomorrow } from 'date-fns';
import { de } from 'date-fns/locale';
import { Check, RotateCw, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import type { Task } from '../types';
import styles from './TaskItem.module.css';

interface TaskItemProps {
    task: Task;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    onSelect: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete, onSelect }) => {
    const controls = useAnimation();

    const handleDragEnd = async (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (info.offset.x > 100) {
            // Swiped right (Complete)
            onToggle(task.id);
            await controls.start({ x: 0 });
        } else if (info.offset.x < -100) {
            // Swiped left (Delete)
            if (confirm('Löschen?')) {
                onDelete(task.id);
            } else {
                await controls.start({ x: 0 });
            }
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
            {/* Background Actions */}
            <div className={clsx(styles.actionBackground, styles.completeAction)}>
                <Check size={20} />
            </div>
            <div className={clsx(styles.actionBackground, styles.deleteAction)}>
                <Trash2 size={20} />
            </div>

            <motion.div
                drag="x"
                dragConstraints={{ left: -100, right: 100 }} // Limit swipe distance
                dragElastic={0.1}
                onDragEnd={handleDragEnd}
                animate={controls}
                className={clsx(styles.item, task.isCompleted && styles.completed)}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(task.id)}
            >
                <button
                    className={clsx(styles.checkbox, task.isCompleted && styles.checked)}
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggle(task.id);
                    }}
                >
                    {task.isCompleted && <Check size={14} strokeWidth={3} />}
                </button>

                <div className={styles.content}>
                    <span className={styles.title}>{task.title}</span>
                    <div className={styles.meta}>
                        {task.recurrence && (
                            <span className={styles.tag}>
                                <RotateCw size={12} />
                            </span>
                        )}
                        {task.dueDate && (
                            <span className={clsx(styles.date, task.dueDate < Date.now() && !task.isCompleted && styles.overdue)}>
                                {formatDate(task.dueDate)}
                                {task.dueDate && format(task.dueDate, 'HH:mm') !== '00:00' && `, ${format(task.dueDate, 'HH:mm')}`}
                            </span>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
