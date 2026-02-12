import { consume } from './normalize';

export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'interval' | 'weekday';
export type Unit = 'day' | 'week' | 'month' | 'year';

export interface Recurrence {
    type: RecurrenceType;
    interval?: number; // e.g., every 3 days
    weekday?: number; // 0-6, where 0 is Sunday
    unit?: Unit;
    daysOfWeek?: number[]; // for multiple weekdays
}

const WEEKDAYS: { [key: string]: number } = {
    'so': 0, 'sonntag': 0, 'sunday': 0, 'sun': 0,
    'mo': 1, 'montag': 1, 'monday': 1, 'mon': 1,
    'di': 2, 'dienstag': 2, 'tuesday': 2, 'tue': 2,
    'mi': 3, 'mittwoch': 3, 'wednesday': 3, 'wed': 3,
    'do': 4, 'donnerstag': 4, 'thursday': 4, 'thu': 4,
    'fr': 5, 'freitag': 5, 'friday': 5, 'fri': 5,
    'sa': 6, 'samstag': 6, 'saturday': 6, 'sat': 6
};

/**
 * Parse recurrence from text
 */
export const parseRecurrence = (text: string): [Recurrence | null, string] => {
    let remaining = text;
    let recurrence: Recurrence | null = null;

    // DAILY
    if (/\b(jeden tag|täglich|every day|daily)\b/i.test(remaining)) {
        recurrence = { type: 'daily' };
        remaining = consume(remaining, /\b(jeden tag|täglich|every day|daily)\b/i);
        return [recurrence, remaining];
    }

    // MONTHLY
    if (/\b(jeden monat|monatlich|every month|monthly)\b/i.test(remaining)) {
        recurrence = { type: 'monthly' };
        remaining = consume(remaining, /\b(jeden monat|monatlich|every month|monthly)\b/i);
        return [recurrence, remaining];
    }

    // YEARLY
    if (/\b(jährlich|yearly|every year|annually|jedes jahr)\b/i.test(remaining)) {
        recurrence = { type: 'yearly' };
        remaining = consume(remaining, /\b(jährlich|yearly|every year|annually|jedes jahr)\b/i);
        return [recurrence, remaining];
    }

    // EVERY X DAYS/WEEKS/MONTHS (e.g., "alle 3 tage", "every 2 weeks")
    const everyXMatch = remaining.match(/\b(alle?|every)\s+(\d+)\s*(tagen?|wochen?|monaten?|tagen?|tagen?|days?|weeks?|months?)\b/i);
    if (everyXMatch) {
        const amount = parseInt(everyXMatch[2], 10);
        const unitStr = everyXMatch[3].toLowerCase();
        let unit: Unit = 'day';
        let type: RecurrenceType = 'interval';

        if (unitStr.startsWith('tag') || unitStr.startsWith('day')) {
            unit = 'day';
        } else if (unitStr.startsWith('woch') || unitStr.startsWith('week')) {
            unit = 'week';
        } else if (unitStr.startsWith('monat') || unitStr.startsWith('month')) {
            unit = 'month';
            type = 'monthly'; // or 'interval'
        }

        recurrence = { type, interval: amount, unit };
        remaining = consume(remaining, everyXMatch[0]);
        return [recurrence, remaining];
    }

    // SPECIFIC WEEKDAY (e.g., "jeden Montag", "every Monday")
    const weekdayMatch = remaining.match(/\b(jeden?|every|jede?|alle?)?\s*(montag|monday|dienstag|tuesday|mittwoch|wednesday|donnerstag|thursday|freitag|friday|samstag|saturday|sonntag|sunday)\b/i);
    if (weekdayMatch) {
        const dayName = weekdayMatch[2].toLowerCase();
        for (const [key, dayIdx] of Object.entries(WEEKDAYS)) {
            if (dayName.includes(key.slice(0, 3)) || dayName === key) {
                recurrence = { type: 'weekday', weekday: dayIdx };
                remaining = consume(remaining, weekdayMatch[0]);
                return [recurrence, remaining];
            }
        }
    }

    // WEEKLY (generic)
    if (/\b(jede woche|wöchentlich|every week|weekly)\b/i.test(remaining)) {
        recurrence = { type: 'weekly' };
        remaining = consume(remaining, /\b(jede woche|wöchentlich|every week|weekly)\b/i);
        return [recurrence, remaining];
    }

    return [null, remaining];
};
