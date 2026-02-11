import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Task, NewTask } from '../types';
import { taskService } from '../services/taskService';

interface TaskContextType {
    tasks: Task[];
    loading: boolean;
    addTask: (task: NewTask) => Promise<Task>;
    toggleTask: (id: string, completed?: boolean) => Promise<void>;
    updateTask: (id: string, updates: Partial<Task>) => Promise<Task | undefined>;
    deleteTask: (id: string) => Promise<void>;
    refreshTasks: () => void;
    selectedTaskId: string | null;
    setSelectedTaskId: (id: string | null) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

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
        return newTask;
    };

    const toggleTask = async (id: string, completed?: boolean) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        const newStatus = completed !== undefined ? completed : !task.isCompleted;
        const updated = await taskService.update(id, { isCompleted: newStatus });

        if (updated) {
            setTasks(prev => prev.map(t => t.id === id ? updated : t));
        }
    };

    const updateTask = async (id: string, updates: Partial<Task>) => {
        const updated = await taskService.update(id, updates);
        if (updated) {
            setTasks(prev => prev.map(t => t.id === id ? updated : t));
        }
        return updated;
    };

    const deleteTask = async (id: string) => {
        await taskService.delete(id);
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    return (
        <TaskContext.Provider value={{
            tasks,
            loading,
            addTask,
            toggleTask,
            updateTask,
            deleteTask,
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
