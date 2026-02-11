import { useEffect, useState, useCallback } from 'react';
import { useTasks } from './useTasks';
import { isSameMinute } from 'date-fns';

export const useNotifications = () => {
    const { tasks } = useTasks();
    const [permission, setPermission] = useState<NotificationPermission>(
        typeof Notification !== 'undefined' ? Notification.permission : 'default'
    );
    const [notifiedTasks, setNotifiedTasks] = useState<Set<string>>(new Set());

    const requestPermission = async () => {
        if (!('Notification' in window)) return false;
        const result = await Notification.requestPermission();
        setPermission(result);
        return result === 'granted';
    };

    const checkDueTasks = useCallback(() => {
        if (permission !== 'granted') return;

        const now = Date.now();
        const dueTasks = tasks.filter(task => {
            if (!task.dueDate || task.isCompleted || notifiedTasks.has(task.id)) return false;
            // Only notify if the task is due in the current minute
            return isSameMinute(task.dueDate, now);
        });

        dueTasks.forEach(task => {
            new Notification('Luma Task', {
                body: task.content,
                icon: '/pwa-192x192.png',
                tag: task.id,
                requireInteraction: true
            });
            setNotifiedTasks(prev => new Set(prev).add(task.id));
        });
    }, [tasks, permission, notifiedTasks]);

    useEffect(() => {
        if (!('Notification' in window) || permission !== 'granted') return;

        const interval = setInterval(checkDueTasks, 10000); // Check every 10s
        return () => clearInterval(interval);
    }, [checkDueTasks, permission]);

    return {
        requestPermission,
        permission,
        isSupported: typeof Notification !== 'undefined'
    };
};
