import { type Task } from '../types';

export interface Suggestion {
    id: string;
    type: 'recurring' | 'time_of_day' | 'posponed';
    message: string;
    actionLabel: string;
    apply: (task: Task) => Partial<Task>;
}

export const analyzeTasks = (tasks: Task[]): Suggestion | null => {
    // 1. Check for repeated identical titles that aren't recurring yet
    const titles = tasks.filter(t => !t.recurrence).map(t => t.title.toLowerCase());
    const counts: { [key: string]: number } = {};
    titles.forEach(t => counts[t] = (counts[t] || 0) + 1);

    const commonTitle = Object.keys(counts).find(title => counts[title] >= 3);
    if (commonTitle) {
        return {
            id: `recurring-${commonTitle}`,
            type: 'recurring',
            message: `„${commonTitle}“ scheint sich zu wiederholen.`,
            actionLabel: 'Wöchentlich machen?',
            apply: () => ({ recurrence: { type: 'weekly' } })
        };
    }

    // 2. Check for typical time of day (future enhancement)
    // 3. Check for frequent postpones

    return null;
};
