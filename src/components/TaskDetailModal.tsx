import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTasks } from '../hooks/useTasks';
import { parseTaskInput } from '../services/nlp';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { X, Calendar as CalendarIcon, RotateCw, Bell, Info } from 'lucide-react';
import clsx from 'clsx';
import { Button } from './ui/Button';
import { Switch } from './ui/Switch';
import styles from './TaskDetailModal.module.css';

export const TaskDetailModal: React.FC = () => {
    const { tasks, selectedTaskId, setSelectedTaskId, updateTask, deleteTask, toggleTask } = useTasks();
    const [editMode, setEditMode] = useState(false);
    const [input, setInput] = useState('');
    const [title, setTitle] = useState('');
    const [hasReminder, setHasReminder] = useState(false);
    const [reminderDate, setReminderDate] = useState<string>('');
    const [parsedPreview, setParsedPreview] = useState<ReturnType<typeof parseTaskInput> | null>(null);

    const task = tasks.find(t => t.id === selectedTaskId);

    useEffect(() => {
        if (task) {
            setInput(task.content || '');
            setTitle(task.title || '');
            setHasReminder(!!task.hasReminder);
            setReminderDate(task.reminderDate ? format(task.reminderDate, "yyyy-MM-dd'T'HH:mm") : '');
            setEditMode(false);
        }
    }, [task]);

    useEffect(() => {
        if (editMode && input.trim()) {
            setParsedPreview(parseTaskInput(input));
        } else {
            setParsedPreview(null);
        }
    }, [input, editMode]);

    if (!selectedTaskId || !task) return null;

    const handleClose = () => setSelectedTaskId(null);

    const handleUpdate = async () => {
        const parsed = input.trim() ? parseTaskInput(input) : null;

        await updateTask(task.id, {
            content: input,
            title: title || parsed?.title || task.title,
            dueDate: parsed?.date ? parsed.date.getTime() : task.dueDate,
            recurrence: parsed?.recurrence || task.recurrence,
            hasReminder,
            reminderDate: hasReminder && reminderDate ? new Date(reminderDate).getTime() : undefined
        });

        setEditMode(false);
    };

    const handleDelete = async () => {
        if (confirm('Aufgabe wirklich löschen?')) {
            await deleteTask(task.id);
            handleClose();
        }
    };

    const handleToggle = async () => {
        await toggleTask(task.id);
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
                        className={clsx(styles.modal, 'glass')}
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    >
                        <div className={styles.header}>
                            <div className={styles.dragHandle} />
                            <Button variant="ghost" size="icon" onClick={handleClose} className={styles.closeBtn}>
                                <X size={16} />
                            </Button>
                        </div>

                        <div className={styles.content}>
                            {editMode ? (
                                <div className={styles.editContainer}>
                                    <div className={styles.inputGroup}>
                                        <input
                                            className={styles.titleInput}
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Titel"
                                        />
                                        <textarea
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            className={styles.textarea}
                                            placeholder="Notizen hinzufügen..."
                                        />
                                    </div>

                                    <div className={styles.groupedList}>
                                        <div className={styles.listItem}>
                                            <div className={styles.itemLabel}>
                                                <div className={styles.iconBox} style={{ background: '#FF9F0A' }}>
                                                    <Bell size={18} />
                                                </div>
                                                <span>Erinnerung</span>
                                            </div>
                                            <Switch checked={hasReminder} onChange={setHasReminder} />
                                        </div>
                                        {hasReminder && (
                                            <div className={styles.datePickerRow}>
                                                <input
                                                    type="datetime-local"
                                                    className={styles.dateTimeInput}
                                                    value={reminderDate}
                                                    onChange={(e) => setReminderDate(e.target.value)}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {parsedPreview && (parsedPreview.date || parsedPreview.recurrence) && (
                                        <div className={styles.preview}>
                                            {parsedPreview.date && (
                                                <span className={styles.previewTag}>
                                                    <CalendarIcon size={12} />
                                                    {format(parsedPreview.date, "eee, d. MMM HH:mm", { locale: de })}
                                                </span>
                                            )}
                                            {parsedPreview.recurrence && (
                                                <span className={styles.previewTag}>
                                                    <RotateCw size={12} />
                                                    {parsedPreview.recurrence.type === 'daily' ? 'Täglich' : 'Wöchentlich'}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <div className={styles.editActions}>
                                        <button onClick={() => setEditMode(false)} className={styles.cancelBtn}>
                                            Abbrechen
                                        </button>
                                        <button onClick={handleUpdate} className={styles.saveBtn}>
                                            Fertig
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.viewContainer} onClick={() => setEditMode(true)}>
                                    <h2 className={styles.title}>{task.title}</h2>
                                    {task.content && <p className={styles.hint}>{task.content}</p>}

                                    <div className={styles.preview}>
                                        {task.dueDate && (
                                            <span className={styles.metaTag}>
                                                <CalendarIcon size={14} />
                                                {format(task.dueDate, 'd. MMMM yyyy', { locale: de })}
                                            </span>
                                        )}
                                        {task.hasReminder && (
                                            <span className={styles.metaTag} style={{ color: 'var(--color-warning)' }}>
                                                <Bell size={14} />
                                                {task.reminderDate ? format(task.reminderDate, 'HH:mm', { locale: de }) : 'An'}
                                            </span>
                                        )}
                                        {task.recurrence && (
                                            <span className={styles.metaTag}>
                                                <RotateCw size={14} />
                                                {task.recurrence.type === 'daily' ? 'Jeden Tag' : 'Wiederkehrend'}
                                            </span>
                                        )}
                                    </div>

                                    <div className={styles.groupedList} style={{ marginTop: '12px' }}>
                                        <div className={styles.listItem}>
                                            <div className={styles.itemLabel}>
                                                <div className={styles.iconBox} style={{ background: '#8E8E93' }}>
                                                    <Info size={18} />
                                                </div>
                                                <span>Details bearbeiten</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className={styles.actions}>
                                <button
                                    className={clsx(styles.actionBtn, task.isCompleted ? styles.active : '')}
                                    onClick={handleToggle}
                                >
                                    {task.isCompleted ? 'Als unerledigt markieren' : 'Erledigen'}
                                </button>

                                <button
                                    className={clsx(styles.actionBtn, styles.deleteBtn)}
                                    onClick={handleDelete}
                                >
                                    Aufgabe löschen
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
