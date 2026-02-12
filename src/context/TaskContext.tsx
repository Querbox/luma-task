import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Task, NewTask } from '../types';
import { taskService } from '../services/taskService';
import { learningEngine } from '../services/learning';
import { useNotification } from './NotificationContext';

interface TaskContextType {
    tasks: Task[];
    loading: boolean;
    addTask: (task: NewTask) => Promise<Task>;
    toggleTask: (id: string, completed?: boolean) => Promise<void>;
    updateTask: (id: string, updates: Partial<Task>) => Promise<Task | undefined>;
    deleteTask: (id: string) => Promise<void>;
    exportTasks: () => Promise<string>;
    importTasks: (jsonData: string) => Promise<void>;
    refreshTasks: () => void;
    selectedTaskId: string | null;
    setSelectedTaskId: (id: string | null) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const { showToast } = useNotification();

    const fetchTasks = useCallback(async () => {
        try {
            const data = await taskService.getAll();
            setTasks(data);
        } catch (err) {
            console.error('Failed to fetch tasks', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const addTask = async (task: NewTask) => {
        const newTask = await taskService.add(task);
        setTasks(prev => [...prev, newTask]);
        showToast('Aufgabe hinzugefügt', 'success');

        // Record learning event
        const dayOfWeek = new Date(task.dueDate || Date.now()).getDay();
        learningEngine.recordEvent({
            taskId: newTask.id,
            title: newTask.title,
            type: 'created',
            timestamp: Date.now(),
            metadata: { dayOfWeek }
        });

        return newTask;
    };

    const toggleTask = async (id: string, completed?: boolean) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        const newStatus = completed !== undefined ? completed : !task.isCompleted;
        const updated = await taskService.update(id, { isCompleted: newStatus });

        if (updated) {
            setTasks(prev => prev.map(t => t.id === id ? updated : t));
            if (newStatus) {
                showToast('Aufgabe abgeschlossen', 'success');

                // Record completion event
                const now = new Date();
                learningEngine.recordEvent({
                    taskId: id,
                    title: task.title,
                    type: 'completed',
                    timestamp: Date.now(),
                    completedAt: Date.now(),
                    metadata: {
                        dayOfWeek: now.getDay(),
                        hourOfCompletion: now.getHours()
                    }
                });
            }
        }
    };

    const updateTask = async (id: string, updates: Partial<Task>) => {
        const updated = await taskService.update(id, updates);
        if (updated) {
            setTasks(prev => prev.map(t => t.id === id ? updated : t));
            showToast('Aufgabe aktualisiert', 'info');
        }
        return updated;
    };

    const deleteTask = async (id: string) => {
        await taskService.delete(id);
        setTasks(prev => prev.filter(t => t.id !== id));
        showToast('Aufgabe gelöscht', 'warning');
    };

    const exportTasks = async () => {
        return await taskService.exportTasks();
    };

    const importTasks = async (jsonData: string) => {
        try {
            await taskService.importTasks(jsonData);
            await fetchTasks();
            showToast('Daten erfolgreich importiert', 'success');
        } catch (err) {
            console.error('Import failed', err);
            showToast('Import fehlgeschlagen', 'error');
            throw err;
        }
    };

    return (
        <TaskContext.Provider value={{
            tasks,
            loading,
            addTask,
            toggleTask,
            updateTask,
            deleteTask,
            exportTasks,
            importTasks,
            refreshTasks: fetchTasks,
            selectedTaskId,
            setSelectedTaskId
        }}>
            {children}
        </TaskContext.Provider>
    );
};

export const useTasks = () => {
    const context = useContext(TaskContext);
    if (!context) {
        throw new Error('useTasks must be used within a TaskProvider');
    }
    return context;
};
