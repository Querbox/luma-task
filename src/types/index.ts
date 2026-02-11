export interface Task {
    id: string;
    content: string; // Raw input
    title: string; // Parsed display title

    dueDate?: number; // Timestamp
    isCompleted: boolean;

    recurrence?: {
        type: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom';
        interval?: number; // e.g. every 2 weeks
        daysOfWeek?: number[]; // 0-6
    };

    // Metadata for intelligence
    createdAt: number;
    completedAt?: number;
    postponedCount: number;
    originalDueDate?: number;
    icon?: string;
    tags?: string[];
}

export type NewTask = Omit<Task, 'id' | 'createdAt' | 'postponedCount' | 'isCompleted'>;
