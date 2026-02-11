import { addDays, setHours, setMinutes, nextDay, isValid } from 'date-fns';

interface ParsedTask {
    title: string;
    date?: Date;
    recurrence?: {
        type: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom';
        interval?: number;
        daysOfWeek?: number[];
    };
}

const WEEKDAYS: { [key: string]: number } = {
    'sonntag': 0, 'montag': 1, 'dienstag': 2, 'mittwoch': 3, 'donnerstag': 4, 'freitag': 5, 'samstag': 6,
    'so': 0, 'mo': 1, 'di': 2, 'mi': 3, 'do': 4, 'fr': 5, 'sa': 6
};

export const parseTaskInput = (input: string): ParsedTask => {
    let title = input;
    let date: Date | undefined = undefined;
    let recurrence: ParsedTask['recurrence'] = undefined;

    const lower = input.toLowerCase();
    const now = new Date();

    // Helper to remove matched string from title
    const consume = (pattern: RegExp | string) => {
        title = title.replace(pattern, '').trim();
        // Clean up double spaces or trailing prepositions often left behind like "am" or "um" at end
        title = title.replace(/\s+(am|um|im|in)\s*$/i, '');
        title = title.replace(/\s+/g, ' ');
    };

    // --- Recurrence ---
    if (lower.match(/jeden\s+([a-zäöü]+)/) || lower.match(/täglich|wöchentlich/)) {
        if (lower.includes('täglich') || lower.includes('jeden tag')) {
            recurrence = { type: 'daily' };
            consume(/täglich|jeden tag/i);
        } else if (lower.includes('wöchentlich') || lower.includes('jede woche')) {
            recurrence = { type: 'weekly' };
            consume(/wöchentlich|jede woche/i);
        } else {
            const match = lower.match(/jeden\s+([a-zäöü]+)/);
            if (match) {
                const dayStr = match[1];
                if (WEEKDAYS[dayStr] !== undefined) {
                    recurrence = { type: 'weekly', daysOfWeek: [WEEKDAYS[dayStr]] };
                    // If we say "every Monday", we probably also mean the next occurrence of Monday as the start date
                    if (!date) {
                        const dayIndex = WEEKDAYS[dayStr];
                        date = nextDay(now, dayIndex as any); // cast for simplified Day type
                    }
                    consume(match[0]);
                }
            }
        }
    }

    // --- Dates ---

    // "Morgen" / "Übermorgen" / "Heute"
    if (lower.includes('morgen') && !lower.includes('morgens')) { // distingue from time of day
        // careful with "morgen früh" -> tomorrow morning
        date = addDays(now, 1);
        consume(/morgen/i);
    } else if (lower.includes('übermorgen')) {
        date = addDays(now, 2);
        consume(/übermorgen/i);
    } else if (lower.includes('heute')) {
        date = now;
        consume(/heute/i);
    }

    // Weekdays: "am Montag", "nächsten Freitag", "Freitag"
    // Scan for weekday names
    for (const [dayName, dayIndex] of Object.entries(WEEKDAYS)) {
        // Only match full words to avoid partials inside other words
        const regex = new RegExp(`\\b(am\\s+|nächsten\\s+)?${dayName}\\b`, 'i');
        if (regex.test(title) && !recurrence) { // Prioritize recurrence if set
            // Logic: if day is today or past, assume next week? Or just next instance?
            // "nextDay" from date-fns always returns next instance
            date = nextDay(now, dayIndex as any);
            consume(regex);
            break;
        }
    }

    // Explicit dates: 24.12. or 24.12.2024
    const dateMatch = title.match(/\b(\d{1,2})\.(\d{1,2})(\.(\d{2,4}))?\b/);
    if (dateMatch) {
        const day = parseInt(dateMatch[1], 10);
        const month = parseInt(dateMatch[2], 10) - 1;
        let year = now.getFullYear();
        if (dateMatch[4]) {
            year = parseInt(dateMatch[4].length === 2 ? `20${dateMatch[4]}` : dateMatch[4], 10);
        } else {
            // logic: if date passed this year, assume next year?
            // Simple: just current year.
        }

        // Check validity
        const d = new Date(year, month, day);
        if (isValid(d)) {
            date = d;
            consume(dateMatch[0]);
        }
    }

    // --- Time ---

    // Explicit: 14:00, 14.30, 14 Uhr
    const timeMatch = title.match(/\b(\d{1,2})(:|\.)(\d{2})\b/) || title.match(/\b(\d{1,2})\s*uhr\b/i);
    if (timeMatch) {
        let h = 0, m = 0;
        if (timeMatch[2] === ':' || timeMatch[2] === '.') {
            h = parseInt(timeMatch[1], 10);
            m = parseInt(timeMatch[3], 10);
        } else {
            h = parseInt(timeMatch[1], 10);
        }

        if (date) {
            date = setHours(setMinutes(date, m), h);
        } else {
            // If no date set, assume today if time is future, else tomorrow?
            // Or just today.
            date = setHours(setMinutes(now, m), h);
            if (date < now) {
                // passed time today? assume tomorrow?
                // Product choice: usually helpful to assume next occurrence.
                date = addDays(date, 1);
            }
        }
        consume(timeMatch[0]);
    }

    // Vaguer times: "abends", "morgens", "mittags"
    if (lower.includes('abends') || lower.includes('abend')) {
        // 19:00 default
        if (!date) date = now; // assume today if date missing
        date = setHours(setMinutes(date, 0), 19);
        consume(/abends?|am abend/i);
    } else if (lower.includes('morgens') || lower.includes('früh')) {
        // 08:00 default
        if (!date) date = addDays(now, 1); // "früh" usually implies tomorrow if said late? or just today?
        // User said "morgen früh" -> date logic handled "morgen", now specific time
        date = setHours(setMinutes(date, 0), 8);
        consume(/morgens?|in der früh/i);
    } else if (lower.includes('mittags')) {
        if (!date) date = now;
        date = setHours(setMinutes(date, 0), 12);
        consume(/mittags?/i);
    }

    // Clean up title
    title = title.replace(/^(am|um|bis)\s+/i, '');

    return {
        title: title.trim(),
        date,
        recurrence
    };
};
