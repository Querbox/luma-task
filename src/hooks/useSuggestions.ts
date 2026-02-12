/**
 * Hook for using learning-based suggestions
 */

import { useState, useEffect } from 'react';
import { useTasks } from './useTasks';
import { learningEngine, type Suggestion } from '../services/learning';

export const useSuggestions = () => {
    const { tasks } = useTasks();
    const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
    const [dismissedTaskIds, setDismissedTaskIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        // Get suggestions for incomplete tasks
        if (tasks.length === 0) {
            setSuggestion(null);
            return;
        }

        const incompleteTasks = tasks.filter(t => !t.isCompleted);
        if (incompleteTasks.length === 0) {
            setSuggestion(null);
            return;
        }

        // Find first task with suggestions that hasn't been dismissed
        for (const task of incompleteTasks) {
            if (dismissedTaskIds.has(task.id)) continue;

            const suggestions = learningEngine.getSuggestions(task);
            if (suggestions.length > 0) {
                setSuggestion(suggestions[0]);
                return;
            }
        }

        setSuggestion(null);
    }, [tasks, dismissedTaskIds]);

    const dismissSuggestion = () => {
        if (suggestion) {
            setDismissedTaskIds(prev => new Set([...prev, suggestion.taskId]));
            setSuggestion(null);
        }
    };

    const acceptSuggestion = async (callback?: () => void) => {
        if (suggestion) {
            dismissSuggestion();
            callback?.();
        }
    };

    return {
        suggestion,
        dismissSuggestion,
        acceptSuggestion
    };
};
