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

const COMMON_ICONS = ['🏋️', '🏃', '🧘', '🍳', '🛒', '💼', '📅', '📞', '📚', '💻', '🧹', '😴', '🏥', '💰', '✨', '🔥'];

export const TaskItem: React.FC<TaskItemProps> = ({
    task,
    onToggle,
    onUpdate,
    onDelete,
    suggestion
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(task.title);
    const [preview, setPreview] = useState<{ date?: Date; recurrence?: any; icon?: string; tags?: string[] } | null>(null);
    const [showIconPicker, setShowIconPicker] = useState(false);
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
        setPreview({
            date: parsed.date,
            recurrence: parsed.recurrence,
            icon: parsed.icon,
            tags: parsed.tags
        });
    };

    const handleBlur = () => {
        if (editValue !== task.title || preview) {
            const parsed = parseTaskInput(editValue);
            onUpdate(task.id, {
                title: parsed.title,
                dueDate: parsed.date?.getTime() || task.dueDate,
                recurrence: parsed.recurrence || task.recurrence,
                icon: parsed.icon || task.icon,
                tags: parsed.tags || task.tags
            });
        }
        setIsEditing(false);
        setPreview(null);
    };

    const updateIcon = (icon: string) => {
        onUpdate(task.id, { icon });
        setShowIconPicker(false);
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
                <div
                    className={clsx(styles.iconWrapper, preview?.icon && styles.previewIcon)}
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowIconPicker(!showIconPicker);
                    }}
                >
                    {preview?.icon || task.icon || <span className={styles.placeholderIcon}>⚪️</span>}
                </div>

                <AnimatePresence>
                    {showIconPicker && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className={clsx(styles.iconPicker, 'glass')}
                        >
                            {COMMON_ICONS.map(icon => (
                                <button key={icon} onClick={() => updateIcon(icon)}>{icon}</button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

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
                        {(preview?.tags || task.tags)?.map(tag => (
                            <span key={tag} className={styles.tag}>#{tag}</span>
                        ))}
                        {task.recurrence && !preview?.recurrence && (
                            <span className={styles.tag}>
                                {task.recurrence.type === 'daily' ? 'Täglich' :
                                    task.recurrence.type === 'weekly' ? 'Wöchentlich' :
                                        task.recurrence.type === 'biweekly' ? 'Alle 2 Wochen' :
                                            task.recurrence.type === 'monthly' ? 'Monatlich' : 'Wiederkehrend'}
                            </span>
                        )}
                        {preview?.recurrence && (
                            <span className={clsx(styles.tag, styles.previewTag)}>
                                {preview.recurrence.type === 'daily' ? 'Wird täglich' :
                                    preview.recurrence.type === 'weekly' ? 'Wird wöchentlich' :
                                        preview.recurrence.type === 'biweekly' ? 'Wird alle 2 Wochen' :
                                            preview.recurrence.type === 'monthly' ? 'Wird monatlich' : 'Wird wiederkehrend'}
                            </span>
                        )}
                    </div>
                </div>

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
