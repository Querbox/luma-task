import React, { useState, useEffect, useRef } from 'react';
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
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const wrapperRef = useRef<HTMLFormElement | null>(null);

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
            recurrence: parsedPreview.recurrence,
            icon: parsedPreview.icon,
            tags: parsedPreview.tags
        });

        setInput('');
        setParsedPreview(null);
    };

    useEffect(() => {
        const inputEl = inputRef.current;
        const wrapperEl = wrapperRef.current;
        if (!inputEl || !wrapperEl) return;

        const updateKeyboardOffset = () => {
            if (!window.visualViewport) return;

            // Calculate how much space the keyboard is taking
            const viewport = window.visualViewport;
            const windowHeight = window.innerHeight;
            const visibleHeight = viewport.height;
            const keyboardSize = windowHeight - visibleHeight;

            setKeyboardHeight(Math.max(0, keyboardSize));
        };

        inputEl.addEventListener('focus', () => {
            setTimeout(updateKeyboardOffset, 50);
        });

        inputEl.addEventListener('blur', () => {
            setKeyboardHeight(0);
        });

        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', updateKeyboardOffset);
        }

        return () => {
            inputEl.removeEventListener('focus', updateKeyboardOffset);
            inputEl.removeEventListener('blur', () => {});
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', updateKeyboardOffset);
            }
        };
    }, []);

    return (
        <form
            ref={wrapperRef}
            className={clsx(styles.container, isFocused && styles.focused, 'glass')}
            style={{
                transform: keyboardHeight > 0 ? `translateY(-${Math.min(keyboardHeight, 150)}px)` : 'translateY(0)',
                transition: keyboardHeight === 0 ? 'transform 0.2s ease-out' : 'transform 0.1s linear'
            }}
            onSubmit={handleSubmit}
        >
            <div className={styles.inputWrapper}>
                <input
                    ref={inputRef}
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
            {parsedPreview && (parsedPreview.date || parsedPreview.recurrence || parsedPreview.icon || (parsedPreview.tags && parsedPreview.tags.length > 0)) && (
                <div className={styles.preview}>
                    {parsedPreview.icon && (
                        <span className={styles.iconTag}>
                            {parsedPreview.icon}
                        </span>
                    )}
                    {parsedPreview.tags?.map(tag => (
                        <span key={tag} className={styles.tag}>
                            #{tag}
                        </span>
                    ))}
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
