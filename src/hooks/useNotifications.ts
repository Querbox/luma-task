import { useEffect } from 'react';
import { useTasks } from './useTasks';
import { isSameMinute } from 'date-fns';

export const useNotifications = () => {
    const { tasks } = useTasks();

    const requestPermission = async () => {
        if (!('Notification' in window)) return false;
        if (Notification.permission === 'granted') return true;
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    };

    useEffect(() => {
        if (!('Notification' in window)) return;

        const checkDueTasks = () => {
            const now = Date.now();
            // Simple poll: check if any task is due within the last minute (to avoid double notify)
            // and we haven't notified for it yet?
            // Better: check if task due matches current time.

            const dueTasks = tasks.filter(task => {
                if (!task.dueDate || task.isCompleted) return false;
                // Check if due in the past 60s and we assume we check every 60s
                const diff = Math.abs(task.dueDate - now);
                return diff < 60000; // Due within a minute window
            });

            dueTasks.forEach(task => {
                // Prevent double notification? 
                // We could store "notified" flag in DB, or just use a simple robust time check.
                // For this demo, simple check.
                // Actually, checking "isSameMinute" might be safer.
                if (isSameMinute(task.dueDate!, now)) {
                    new Notification('Luma Task', {
                        body: task.content, // Or title
                        icon: '/pwa-192x192.png',
                        tag: task.id // Prevent duplicate notifications for same task
                    });
                }
            });
        };

        const interval = setInterval(checkDueTasks, 10000); // Check every 10s
        return () => clearInterval(interval);
    }, [tasks]);

    return { requestPermission };
};
