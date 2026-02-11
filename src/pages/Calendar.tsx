import React, { useState, useMemo } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isToday
} from 'date-fns';
import { de } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useTasks } from '../hooks/useTasks';
import { TaskItem } from '../components/TaskItem';
import styles from './Calendar.module.css';

export const Calendar: React.FC = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const { tasks, toggleTask, deleteTask, setSelectedTaskId } = useTasks();

    const days = useMemo(() => {
        const start = startOfWeek(startOfMonth(currentMonth), { locale: de });
        const end = endOfWeek(endOfMonth(currentMonth), { locale: de });
        return eachDayOfInterval({ start, end });
    }, [currentMonth]);

    const tasksForDay = useMemo(() => {
        return tasks.filter(task => {
            if (!task.dueDate) return false;
            return isSameDay(new Date(task.dueDate), selectedDate);
        });
    }, [tasks, selectedDate]);

    const getTaskCountForDay = (date: Date) => {
        return tasks.filter(task => task.dueDate && isSameDay(new Date(task.dueDate), date)).length;
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <button onClick={prevMonth} className={styles.navButton}><ChevronLeft size={24} /></button>
                <h2 className={styles.monthTitle}>
                    {format(currentMonth, 'MMMM yyyy', { locale: de })}
                </h2>
                <button onClick={nextMonth} className={styles.navButton}><ChevronRight size={24} /></button>
            </header>

            <div className={styles.grid}>
                <div className={styles.weekdays}>
                    {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
                        <div key={day} className={styles.weekday}>{day}</div>
                    ))}
                </div>
                <div className={styles.days}>
                    {days.map(day => {
                        const count = getTaskCountForDay(day);
                        const isSelected = isSameDay(day, selectedDate);
                        const isCurrentMonth = isSameMonth(day, currentMonth);

                        return (
                            <button
                                key={day.toISOString()}
                                onClick={() => setSelectedDate(day)}
                                className={clsx(
                                    styles.day,
                                    !isCurrentMonth && styles.outsideMonth,
                                    isSelected && styles.selected,
                                    isToday(day) && styles.today
                                )}
                            >
                                <span className={styles.dayNumber}>{format(day, 'd')}</span>
                                {count > 0 && (
                                    <div className={styles.dots}>
                                        {/* Limit to 3 dots */}
                                        {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                                            <div key={i} className={styles.dot} />
                                        ))}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className={styles.taskList}>
                <h3 className={styles.listTitle}>
                    {isToday(selectedDate) ? 'Heute' : format(selectedDate, 'EEEE, d. MMMM', { locale: de })}
                </h3>
                <div className={styles.items}>
                    {tasksForDay.length > 0 ? (
                        <AnimatePresence>
                            {tasksForDay.map(task => (
                                <TaskItem
                                    key={task.id}
                                    task={task}
                                    onToggle={toggleTask}
                                    onDelete={deleteTask}
                                    onSelect={setSelectedTaskId}
                                />
                            ))}
                        </AnimatePresence>
                    ) : (
                        <p className={styles.empty}>Keine Aufgaben</p>
                    )}
                </div>
            </div>
        </div>
    );
};
