import { getDB } from './db';
import type { Task, NewTask } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const taskService = {
    async getAll(): Promise<Task[]> {
        const db = await getDB();
        return db.getAll('tasks');
    },

    async add(taskData: NewTask): Promise<Task> {
        const db = await getDB();
        const newTask: Task = {
            ...taskData,
            id: uuidv4(),
            createdAt: Date.now(),
            postponedCount: 0,
            isCompleted: false,
        };
        await db.add('tasks', newTask);
        return newTask;
    },

    async update(id: string, updates: Partial<Task>): Promise<Task | undefined> {
        const db = await getDB();
        const tx = db.transaction('tasks', 'readwrite');
        const store = tx.objectStore('tasks');

        const task = await store.get(id);
        if (!task) return undefined;

        const updatedTask = { ...task, ...updates };

        // If completing, mark timestamp
        if (updates.isCompleted === true && !task.isCompleted) {
            updatedTask.completedAt = Date.now();
        } else if (updates.isCompleted === false) {
            updatedTask.completedAt = undefined;
        }

        await store.put(updatedTask);
        await tx.done;
        return updatedTask;
    },

    async delete(id: string): Promise<void> {
        const db = await getDB();
        await db.delete('tasks', id);
    },

    async exportTasks(): Promise<string> {
        const tasks = await this.getAll();
        return JSON.stringify(tasks, null, 2);
    },

    async importTasks(jsonData: string): Promise<void> {
        const tasks = JSON.parse(jsonData) as Task[];
        const db = await getDB();
        const tx = db.transaction('tasks', 'readwrite');
        const store = tx.objectStore('tasks');

        // Clear existing or just merge? Let's merge by putting
        for (const task of tasks) {
            await store.put(task);
        }
        await tx.done;
    }
};
