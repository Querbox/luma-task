import { addDays, setHours, setMinutes, nextDay } from 'date-fns';

interface ParsedTask {
    title: string;
    date?: Date;
    recurrence?: {
        type: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom';
        interval?: number;
        daysOfWeek?: number[];
    };
}

const WEEKDAYS_DE: { [key: string]: number } = {
    'sonntag': 0, 'montag': 1, 'dienstag': 2, 'mittwoch': 3, 'donnerstag': 4, 'freitag': 5, 'samstag': 6,
    'so': 0, 'mo': 1, 'di': 2, 'mi': 3, 'do': 4, 'fr': 5, 'sa': 6
};

const WEEKDAYS_EN: { [key: string]: number } = {
    'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4, 'friday': 5, 'saturday': 6,
    'sun': 0, 'mon': 1, 'tue': 2, 'wed': 3, 'thu': 4, 'fri': 5, 'sat': 6
};

export const parseTaskInput = (input: string): ParsedTask => {
    let title = input;
    let date: Date | undefined = undefined;
    let recurrence: ParsedTask['recurrence'] = undefined;

    const lower = input.toLowerCase();
    const now = new Date();

    const consume = (pattern: RegExp | string) => {
        title = title.replace(pattern, '').trim();
        // Clean up prepositions
        title = title.replace(/\s+(am|um|im|in|at|on|every|jede[nr]?)\s*$/i, '');
        title = title.replace(/\s+/g, ' ');
    };

    // --- Recurrence ---
    const dailyMatch = lower.match(/(jeden tag|täglich|every day|daily)/);
    const weeklyMatch = lower.match(/(jede woche|wöchentlich|every week|weekly)/);

    if (dailyMatch) {
        recurrence = { type: 'daily' };
        consume(dailyMatch[0]);
    } else if (weeklyMatch) {
        recurrence = { type: 'weekly' };
        consume(weeklyMatch[0]);
    } else {
        const everyDayMatch = lower.match(/(jeden|every)\s+([a-zäöü]+)/);
        if (everyDayMatch) {
            const dayStr = everyDayMatch[2];
            const dayIndex = WEEKDAYS_DE[dayStr] ?? WEEKDAYS_EN[dayStr];
            if (dayIndex !== undefined) {
                recurrence = { type: 'weekly', daysOfWeek: [dayIndex] };
                if (!date) date = nextDay(now, dayIndex as any);
                consume(everyDayMatch[0]);
            }
        }
    }

    // --- Dates ---
    if (lower.match(/\b(morgen|tomorrow)\b/)) {
        date = addDays(now, 1);
        consume(/\b(morgen|tomorrow)\b/i);
    } else if (lower.match(/\b(übermorgen|next day)\b/)) {
        date = addDays(now, 2);
        consume(/\b(übermorgen|next day)\b/i);
    } else if (lower.match(/\b(heute|today)\b/)) {
        date = now;
        consume(/\b(heute|today)\b/i);
    } else if (lower.match(/\b(nächste woche|next week)\b/)) {
        date = addDays(now, 7);
        consume(/\b(nächste woche|next week)\b/i);
    }

    // Weekdays
    const allWeekdays = { ...WEEKDAYS_DE, ...WEEKDAYS_EN };
    for (const [dayName, dayIndex] of Object.entries(allWeekdays)) {
        const regex = new RegExp(`\\b(am\\s+|on\\s+|next\\s+|nächsten\\s+)?${dayName}\\b`, 'i');
        if (regex.test(title)) {
            date = nextDay(now, dayIndex as any);
            consume(regex);
            break;
        }
    }

    // --- Time ---
    // Explicit: 14:00, 14.30, 2pm, 14 Uhr
    const timeMatch = title.match(/\b(\d{1,2})(:|\.)(\d{2})\b/) ||
        title.match(/\b(\d{1,2})\s*(uhr|pm|am)\b/i);

    if (timeMatch) {
        let h = parseInt(timeMatch[1], 10);
        let m = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;

        if (timeMatch[2]?.toLowerCase() === 'pm' && h < 12) h += 12;
        if (timeMatch[2]?.toLowerCase() === 'am' && h === 12) h = 0;

        if (date) {
            date = setHours(setMinutes(date, m), h);
        } else {
            date = setHours(setMinutes(now, m), h);
            if (date < now) date = addDays(date, 1);
        }
        consume(timeMatch[0]);
    }

    // Keywords
    if (lower.match(/\b(abends|evening|tonight)\b/)) {
        if (!date) date = now;
        date = setHours(setMinutes(date, 0), 19);
        consume(/\b(abends|evening|tonight|am abend)\b/i);
    } else if (lower.match(/\b(morgens|morning)\b/)) {
        if (!date) date = addDays(now, 1);
        date = setHours(setMinutes(date, 0), 8);
        consume(/\b(morgens|morning|am morgen)\b/i);
    } else if (lower.match(/\b(mittags|noon)\b/)) {
        if (!date) date = now;
        date = setHours(setMinutes(date, 0), 12);
        consume(/\b(mittags|noon)\b/i);
    }

    return {
        title: title.trim().replace(/^([,.\- ]+)|([,.\- ]+)$/g, ''),
        date,
        recurrence
    };
};
