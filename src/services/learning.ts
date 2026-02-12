/**
 * Behavior tracking and learning for intelligent suggestions
 */

import type { Task } from '../types';

export interface TaskEvent {
    taskId: string;
    title: string;
    type: 'created' | 'completed' | 'postponed' | 'edited';
    timestamp: number;
    completedAt?: number; // for 'completed' events
    originalDueDate?: number; // for 'postponed' events
    newDueDate?: number;
    metadata?: {
        dayOfWeek?: number; // 0-6
        hourOfCompletion?: number; // 0-23
        postponeCount?: number;
    };
}

export interface TaskPattern {
    title: string;
    normalizedTitle: string; // for similarity matching
    occurrences: number;
    completionTimes: number[]; // hours of day when completed
    weekdays: Set<number>;
    postponeCount: number;
    lastSeen: number;
}

export interface Suggestion {
    type: 'recurring_weekly' | 'set_time' | 'adjust_date' | 'daily_habit';
    taskId: string;
    message: string;
    action: string;
    confidence: number; // 0-1
}

/**
 * Normalize title for comparison (remove punctuation, extra spaces)
 */
const normalizeTitle = (title: string): string => {
    return title.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};

/**
 * Calculate title similarity (0-1)
 */
const calculateSimilarity = (title1: string, title2: string): number => {
    const norm1 = normalizeTitle(title1);
    const norm2 = normalizeTitle(title2);
    if (norm1 === norm2) return 1;

    const shorter = norm1.length < norm2.length ? norm1 : norm2;
    const longer = norm1.length >= norm2.length ? norm1 : norm2;

    let matches = 0;
    for (let i = 0; i < shorter.length; i++) {
        if (longer[i] === shorter[i]) matches++;
    }

    return matches / longer.length;
};

/**
 * Learning engine - analyzes task patterns
 */
export class LearningEngine {
    private patterns: Map<string, TaskPattern> = new Map();
    private events: TaskEvent[] = [];
    private readonly maxEvents = 1000;

    /**
     * Record a task event
     */
    recordEvent(event: TaskEvent): void {
        this.events.push(event);
        if (this.events.length > this.maxEvents) {
            this.events.shift();
        }
        this.updatePatterns();
    }

    /**
     * Analyze all events and update patterns
     */
    private updatePatterns(): void {
        const patternMap = new Map<string, TaskPattern>();

        for (const event of this.events) {
            const normalizedTitle = normalizeTitle(event.title);
            let pattern = patternMap.get(normalizedTitle);

            if (!pattern) {
                pattern = {
                    title: event.title,
                    normalizedTitle,
                    occurrences: 0,
                    completionTimes: [],
                    weekdays: new Set(),
                    postponeCount: 0,
                    lastSeen: event.timestamp
                };
                patternMap.set(normalizedTitle, pattern);
            }

            pattern.lastSeen = Math.max(pattern.lastSeen, event.timestamp);

            if (event.type === 'created') {
                pattern.occurrences++;
            } else if (event.type === 'completed' && event.metadata?.hourOfCompletion !== undefined) {
                pattern.completionTimes.push(event.metadata.hourOfCompletion);
            } else if (event.type === 'postponed') {
                pattern.postponeCount++;
            }

            if (event.metadata?.dayOfWeek !== undefined) {
                pattern.weekdays.add(event.metadata.dayOfWeek);
            }
        }

        this.patterns = patternMap;
    }

    /**
     * Get suggestions for a task
     */
    getSuggestions(task: Task): Suggestion[] {
        const suggestions: Suggestion[] = [];
        const pattern = this.getPattern(task.title);

        if (!pattern) return suggestions;

        // 1. Weekly recurrence suggestion
        // If task appears 3+ times on same weekday
        if (pattern.occurrences >= 3 && pattern.weekdays.size === 1) {
            const dayOfWeek = Array.from(pattern.weekdays)[0];
            const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
            suggestions.push({
                type: 'recurring_weekly',
                taskId: task.id,
                message: `"${task.title}" jeden ${days[dayOfWeek]} wiederholen?`,
                action: 'setWeeklyRecurrence',
                confidence: 0.9
            });
        }

        // 2. Time suggestion
        // If task completed 3+ times around same time
        if (pattern.completionTimes.length >= 3) {
            const avgHour = Math.round(
                pattern.completionTimes.reduce((a, b) => a + b, 0) / pattern.completionTimes.length
            );
            suggestions.push({
                type: 'set_time',
                taskId: task.id,
                message: `Standardzeit auf ${String(avgHour).padStart(2, '0')}:00 setzen?`,
                action: 'setDefaultTime',
                confidence: 0.8
            });
        }

        // 3. Frequent postpones
        if (pattern.postponeCount >= 3) {
            suggestions.push({
                type: 'adjust_date',
                taskId: task.id,
                message: `Diese Aufgabe wird oft verschoben. Ein besseres Datum?`,
                action: 'suggestNewDate',
                confidence: 0.7
            });
        }

        // 4. Daily habit
        // If task created 7+ days in a row
        const recentEvents = this.events.filter(e =>
            e.title === task.title &&
            e.timestamp > Date.now() - 7 * 24 * 60 * 60 * 1000
        );
        if (recentEvents.length >= 7) {
            suggestions.push({
                type: 'daily_habit',
                taskId: task.id,
                message: `Das ist eine tägliche Routine. Als täglich festlegen?`,
                action: 'setDailyRecurrence',
                confidence: 0.85
            });
        }

        // Sort by confidence
        suggestions.sort((a, b) => b.confidence - a.confidence);
        return suggestions.slice(0, 1); // Return top 1 suggestion
    }

    /**
     * Get pattern for a task title
     */
    private getPattern(title: string): TaskPattern | null {
        const normalized = normalizeTitle(title);

        // Exact match
        if (this.patterns.has(normalized)) {
            return this.patterns.get(normalized)!;
        }

        // Similarity match (threshold: 0.7)
        for (const [key, pattern] of this.patterns.entries()) {
            if (calculateSimilarity(normalized, key) > 0.7) {
                return pattern;
            }
        }

        return null;
    }

    /**
     * Load patterns from storage
     */
    loadFromStorage(data: any): void {
        try {
            if (data.events) {
                this.events = data.events;
            }
            this.updatePatterns();
        } catch (err) {
            console.error('Failed to load learning data', err);
        }
    }

    /**
     * Save patterns to storage
     */
    saveToStorage(): any {
        return {
            events: this.events,
            patterns: Array.from(this.patterns.entries())
        };
    }
}

/**
 * Singleton instance
 */
export const learningEngine = new LearningEngine();
