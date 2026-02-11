import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTasks } from '../hooks/useTasks';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { X, Calendar as CalendarIcon, RotateCw, Bell, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import styles from './TaskDetailModal.module.css';

export const TaskDetailModal: React.FC = () => {
    const { tasks, selectedTaskId, setSelectedTaskId, updateTask, deleteTask, toggleTask } = useTasks();
    const [title, setTitle] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showReminderPicker, setShowReminderPicker] = useState(false);
    const titleInputRef = useRef<HTMLInputElement>(null);

    const task = tasks.find(t => t.id === selectedTaskId);

    useEffect(() => {
        if (task) {
            setTitle(task.title || '');
        }
    }, [task?.id]);

    if (!selectedTaskId || !task) return null;

    const handleClose = () => {
        setSelectedTaskId(null);
        setShowDatePicker(false);
        setShowReminderPicker(false);
    };

    const handleTitleChange = async (newTitle: string) => {
        setTitle(newTitle);
        if (newTitle.trim() && newTitle !== task.title) {
            await updateTask(task.id, { title: newTitle });
        }
    };

    const handleDateChange = async (dateStr: string) => {
        if (dateStr) {
            await updateTask(task.id, {
                dueDate: new Date(dateStr).getTime()
            });
        }
        setShowDatePicker(false);
    };

    const handleReminderToggle = async () => {
        setShowReminderPicker(!showReminderPicker);
    };

    const handleReminderDateChange = async (dateStr: string) => {
        if (dateStr) {
            await updateTask(task.id, {
                reminderDate: new Date(dateStr).getTime(),
                hasReminder: true
            });
        }
        setShowReminderPicker(false);
    };

    const handleDelete = async () => {
        if (confirm('Aufgabe wirklich löschen?')) {
            await deleteTask(task.id);
            handleClose();
        }
    };

    const handleToggle = async () => {
        await toggleTask(task.id);
        handleClose();
    };

    return (
        <AnimatePresence>
            {selectedTaskId && (
                <>
                    <motion.div
                        className={styles.backdrop}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                    />
                    <motion.div
                        className={styles.modal}
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    >
                        <div className={styles.handle} />

                        <button className={styles.closeBtn} onClick={handleClose}>
                            <X size={20} />
                        </button>

                        <div className={styles.content}>
                            {/* Title - tap to edit */}
                            <input
                                ref={titleInputRef}
                                className={styles.titleInput}
                                value={title}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                placeholder="Aufgabe"
                            />

                            {/* Info rows - tap to change */}
                            <div className={styles.infoList}>
                                {/* Date */}
                                <button
                                    className={styles.infoRow}
                                    onClick={() => setShowDatePicker(!showDatePicker)}
                                >
                                    <div className={styles.infoLeft}>
                                        <CalendarIcon size={20} className={styles.icon} />
                                        <span className={styles.label}>Datum</span>
                                    </div>
                                    <div className={styles.infoRight}>
                                        {task.dueDate ? (
                                            <span className={styles.value}>
                                                {format(task.dueDate, 'd. MMM yyyy', { locale: de })}
                                            </span>
                                        ) : (
                                            <span className={styles.placeholder}>Hinzufügen</span>
                                        )}
                                        <ChevronRight size={18} className={styles.chevron} />
                                    </div>
                                </button>

                                {showDatePicker && (
                                    <div className={styles.pickerRow}>
                                        <input
                                            type="date"
                                            className={styles.picker}
                                            defaultValue={task.dueDate ? format(task.dueDate, 'yyyy-MM-dd') : ''}
                                            onChange={(e) => handleDateChange(e.target.value)}
                                        />
                                    </div>
                                )}

                                {/* Repeat */}
                                <button className={styles.infoRow}>
                                    <div className={styles.infoLeft}>
                                        <RotateCw size={20} className={styles.icon} />
                                        <span className={styles.label}>Wiederholen</span>
                                    </div>
                                    <div className={styles.infoRight}>
                                        {task.recurrence ? (
                                            <span className={styles.value}>
                                                {task.recurrence.type === 'daily' ? 'Täglich' : 'Wöchentlich'}
                                            </span>
                                        ) : (
                                            <span className={styles.placeholder}>Nie</span>
                                        )}
                                        <ChevronRight size={18} className={styles.chevron} />
                                    </div>
                                </button>

                                {/* Reminder */}
                                <button
                                    className={styles.infoRow}
                                    onClick={handleReminderToggle}
                                >
                                    <div className={styles.infoLeft}>
                                        <Bell size={20} className={styles.icon} />
                                        <span className={styles.label}>Erinnerung</span>
                                    </div>
                                    <div className={styles.infoRight}>
                                        {task.hasReminder && task.reminderDate ? (
                                            <span className={styles.value}>
                                                {format(task.reminderDate, 'd. MMM, HH:mm', { locale: de })}
                                            </span>
                                        ) : (
                                            <span className={styles.placeholder}>Aus</span>
                                        )}
                                        <ChevronRight size={18} className={styles.chevron} />
                                    </div>
                                </button>

                                {showReminderPicker && (
                                    <div className={styles.pickerRow}>
                                        <input
                                            type="datetime-local"
                                            className={styles.picker}
                                            defaultValue={task.reminderDate ? format(task.reminderDate, "yyyy-MM-dd'T'HH:mm") : ''}
                                            onChange={(e) => handleReminderDateChange(e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className={styles.actions}>
                                <button
                                    className={clsx(styles.actionBtn, styles.completeBtn)}
                                    onClick={handleToggle}
                                >
                                    {task.isCompleted ? 'Als unerledigt markieren' : 'Erledigen'}
                                </button>

                                <button
                                    className={clsx(styles.actionBtn, styles.deleteBtn)}
                                    onClick={handleDelete}
                                >
                                    Löschen
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
