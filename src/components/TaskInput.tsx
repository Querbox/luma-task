import React, { useState, useEffect } from 'react';
import { Send, Plus, Calendar as CalendarIcon, RotateCw } from 'lucide-react';
import { parseTaskInput } from '../services/nlp'; // We need to fix the import path potentially? No, same src structure.
import type { NewTask } from '../types';
import clsx from 'clsx';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import styles from './TaskInput.module.css';

interface TaskInputProps {
    onAddTask: (task: NewTask) => void;
}

export const TaskInput: React.FC<TaskInputProps> = ({ onAddTask }) => {
    const [input, setInput] = useState('');
    const [parsedPreview, setParsedPreview] = useState<ReturnType<typeof parseTaskInput> | null>(null);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (input.trim()) {
            const parsed = parseTaskInput(input);
            setParsedPreview(parsed);
        } else {
            setParsedPreview(null);
        }
    }, [input]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !parsedPreview) return;

        onAddTask({
            content: input,
            title: parsedPreview.title,
            dueDate: parsedPreview.date ? parsedPreview.date.getTime() : undefined,
            recurrence: parsedPreview.recurrence
        });

        setInput('');
        setParsedPreview(null);
    };

    return (
        <form
            className={clsx(styles.container, isFocused && styles.focused, 'glass')}
            onSubmit={handleSubmit}
        >
            <div className={styles.inputWrapper}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Neue Aufgabe..."
                    className={styles.input}
                />
                <button
                    type="submit"
                    disabled={!input.trim()}
                    className={styles.sendButton}
                >
                    {input.trim() ? <Send size={20} /> : <Plus size={24} />}
                </button>
            </div>

            {/* Intelligence Preview */}
            {parsedPreview && (parsedPreview.date || parsedPreview.recurrence) && (
                <div className={styles.preview}>
                    {parsedPreview.date && (
                        <span className={styles.tag}>
                            <CalendarIcon size={12} />
                            {format(parsedPreview.date, "eee, d. MMM HH:mm", { locale: de })}
                        </span>
                    )}
                    {parsedPreview.recurrence && (
                        <span className={styles.tag}>
                            <RotateCw size={12} />
                            {parsedPreview.recurrence.type === 'weekly' ? 'Wöchentlich' : 'Täglich'}
                        </span>
                    )}
                </div>
            )}
        </form>
    );
};
