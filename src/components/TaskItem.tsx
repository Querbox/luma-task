import React, { useState, useRef, useEffect } from 'react';
import { motion, type PanInfo, useAnimation, AnimatePresence } from 'framer-motion';
import { format, isToday, isTomorrow } from 'date-fns';
import { de } from 'date-fns/locale';
import { Check, Trash2, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import type { Task } from '../types';
import { parseTaskInput } from '../services/nlp';
import styles from './TaskItem.module.css';

interface TaskItemProps {
    task: Task;
    onToggle: (id: string, completed?: boolean) => void;
    onUpdate: (id: string, updates: Partial<Task>) => void;
    onDelete: (id: string) => void;
    onSelect: (id: string) => void;
    suggestion?: { message: string; actionLabel: string; apply: (task: Task) => Partial<Task> } | null;
}

export const TaskItem: React.FC<TaskItemProps> = ({
    task,
    onToggle,
    onUpdate,
    onDelete,
    suggestion
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(task.title);
    const [preview, setPreview] = useState<{ date?: Date; recurrence?: any } | null>(null);
    const controls = useAnimation();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleDragEnd = async (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setEditValue(val);
        const parsed = parseTaskInput(val);
        if (parsed.date || parsed.recurrence) {
            setPreview({ date: parsed.date, recurrence: parsed.recurrence });
        } else {
            setPreview(null);
        }
    };

    const handleBlur = () => {
        if (editValue !== task.title || preview) {
            const parsed = parseTaskInput(editValue);
            onUpdate(task.id, {
                title: parsed.title,
                dueDate: parsed.date?.getTime() || task.dueDate,
                recurrence: parsed.recurrence || task.recurrence
            });
        }
        setIsEditing(false);
        setPreview(null);
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
            <div className={clsx(styles.actionBackground, styles.completeAction)}>
                <Check size={20} strokeWidth={3} />
            </div>
            <div className={clsx(styles.actionBackground, styles.deleteAction)}>
                <Trash2 size={20} strokeWidth={2.5} />
            </div>

            <motion.div
                drag="x"
                dragConstraints={{ left: -100, right: 100 }}
                dragElastic={0.15}
                onDragEnd={handleDragEnd}
                animate={controls}
                className={clsx(styles.item, task.isCompleted && styles.completed)}
                onClick={() => !isEditing && setIsEditing(true)}
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
                            >
                                <Check size={14} strokeWidth={4} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </button>

                <div className={styles.content}>
                    {isEditing ? (
                        <input
                            ref={inputRef}
                            className={styles.titleInput}
                            value={editValue}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
                        />
                    ) : (
                        <span className={styles.title}>{task.title}</span>
                    )}

                    <div className={styles.meta}>
                        {(preview?.date || task.dueDate) && (
                            <span className={clsx(
                                styles.date,
                                task.dueDate && task.dueDate < Date.now() && !task.isCompleted && styles.overdue,
                                preview?.date && styles.previewDate
                            )}>
                                {formatDate(preview?.date?.getTime() || task.dueDate)}
                            </span>
                        )}
                        {task.recurrence && !preview?.recurrence && (
                            <span className={styles.tag}>Wiederkehrend</span>
                        )}
                        {preview?.recurrence && (
                            <span className={clsx(styles.tag, styles.previewTag)}>Wird wiederkehrend</span>
                        )}
                    </div>
                </div>

                <AnimatePresence>
                    {suggestion && !isEditing && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={styles.suggestion}
                            onClick={(e) => {
                                e.stopPropagation();
                                onUpdate(task.id, suggestion.apply(task));
                            }}
                        >
                            <Sparkles size={14} className={styles.sparkle} />
                            <span>{suggestion.actionLabel}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};
