import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTasks } from '../hooks/useTasks';
import { parseTaskInput } from '../services/nlp';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { X, Trash2, CheckCircle2, Calendar as CalendarIcon, RotateCw } from 'lucide-react';
import clsx from 'clsx';
import { Button } from './ui/Button';
import styles from './TaskDetailModal.module.css';

export const TaskDetailModal: React.FC = () => {
    const { tasks, selectedTaskId, setSelectedTaskId, updateTask, deleteTask, toggleTask } = useTasks();
    const [editMode, setEditMode] = useState(false);
    const [input, setInput] = useState('');
    const [parsedPreview, setParsedPreview] = useState<ReturnType<typeof parseTaskInput> | null>(null);

    // Find the selected task
    const task = tasks.find(t => t.id === selectedTaskId);

    useEffect(() => {
        if (task) {
            // When opening, reset input to task content (or meaningful default)
            setInput(task.content || task.title);
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
        if (!input.trim()) return;

        // Parse the new input to extract date/recurrence
        const parsed = parseTaskInput(input);

        await updateTask(task.id, {
            content: input,
            title: parsed.title,
            dueDate: parsed.date ? parsed.date.getTime() : task.dueDate, // Keep old date if not mentioned? Or clear? 
            // Better logic: If parsed.date is undefined, it means no new date was mentioned. 
            // Should we keep the old one? Usually yes, unless explicitly removed. 
            // But if I change "Gym tomorrow" to "Gym", I might mean remove date.
            // For now, let's assume if it finds a date, it updates. If not, it keeps old.
            // Power user might want "Gym remove date".
            recurrence: parsed.recurrence || task.recurrence
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
        // Automatically close if completing? Maybe just minimal feedback.
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
                                <X size={20} />
                            </Button>
                        </div>

                        <div className={styles.content}>
                            {editMode ? (
                                <div className={styles.editContainer}>
                                    <textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        className={styles.textarea}
                                        placeholder="Notizen hinzufügen..."
                                        autoFocus
                                    />

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
                                        <button onClick={() => setEditMode(false)} className="text-secondary" style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-body)' }}>
                                            Abbrechen
                                        </button>
                                        <button onClick={handleUpdate} style={{ color: 'var(--color-accent)', fontWeight: '600', fontSize: 'var(--font-size-body)' }}>
                                            Speichern
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.viewContainer} onClick={() => setEditMode(true)}>
                                    <h2 className={styles.title}>{task.title}</h2>
                                    <div className={styles.metaRow}>
                                        {task.dueDate && (
                                            <span className={styles.metaTag}>
                                                <CalendarIcon size={14} />
                                                {format(task.dueDate, 'd. MMMM yyyy', { locale: de })}
                                            </span>
                                        )}
                                        {task.recurrence && (
                                            <span className={styles.metaTag}>
                                                <RotateCw size={14} />
                                                {task.recurrence.type === 'daily' ? 'Jeden Tag' : 'Wiederkehrend'}
                                            </span>
                                        )}
                                    </div>
                                    <p className={styles.hint}>Tippen zum Bearbeiten</p>
                                </div>
                            )}

                            <div className={styles.actions}>
                                <button
                                    className={clsx(styles.actionBtn, task.isCompleted ? styles.active : '')}
                                    onClick={handleToggle}
                                >
                                    <CheckCircle2 size={20} />
                                    <span>{task.isCompleted ? 'Als unerledigt markieren' : 'Erledigen'}</span>
                                </button>

                                <button
                                    className={clsx(styles.actionBtn, styles.deleteBtn)}
                                    onClick={handleDelete}
                                >
                                    <Trash2 size={20} />
                                    <span>Löschen</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
