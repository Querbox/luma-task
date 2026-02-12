import { addDays, addWeeks, addMonths, addYears, nextDay, setHours, setMinutes } from 'date-fns';
import { consume } from './normalize';

export interface ParsedDate {
    date: Date;
    hasExplicitTime: boolean;
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
 * Parse relative dates (heute, morgen, übermorgen, etc)
 */
export const parseRelativeDate = (text: string): [Date | null, string] => {
    const now = new Date();
    let remaining = text;

    if (/\b(heute|today)\b/i.test(remaining)) {
        return [now, consume(remaining, /\b(heute|today)\b/i)];
    }

    if (/\b(morgen|tomorrow)\b/i.test(remaining)) {
        return [addDays(now, 1), consume(remaining, /\b(morgen|tomorrow)\b/i)];
    }

    if (/\b(übermorgen)\b/i.test(remaining)) {
        return [addDays(now, 2), consume(remaining, /\b(übermorgen)\b/i)];
    }

    if (/\b(nächste woche|next week)\b/i.test(remaining)) {
        return [addWeeks(now, 1), consume(remaining, /\b(nächste woche|next week)\b/i)];
    }

    if (/\b(in|in)\s+(\d+)\s+(tagen?|wochen?|monaten?|days?|weeks?|months?)\b/i.test(remaining)) {
        const match = remaining.match(/\b(in|in)\s+(\d+)\s+(tagen?|wochen?|monaten?|tagen?|tagen?|days?|weeks?|months?)\b/i);
        if (match) {
            const amount = parseInt(match[2], 10);
            const unit = match[3].toLowerCase();
            let date: Date = now;

            if (unit.startsWith('tag') || unit.startsWith('day')) {
                date = addDays(now, amount);
            } else if (unit.startsWith('woch') || unit.startsWith('week')) {
                date = addWeeks(now, amount);
            } else if (unit.startsWith('monat') || unit.startsWith('month')) {
                date = addMonths(now, amount);
            }

            return [date, consume(remaining, match[0])];
        }
    }

    return [null, remaining];
};

/**
 * Parse specific weekday (Montag, Monday, etc)
 */
export const parseWeekdayDate = (text: string): [Date | null, string] => {
    const now = new Date();
    let remaining = text;

    for (const [key, dayIdx] of Object.entries(WEEKDAYS)) {
        const regex = new RegExp(`\\b(am|on|next|nächsten?|nächster)?\\s*${key}\\b`, 'i');
        if (regex.test(remaining)) {
            const nextDate = nextDay(now, dayIdx as any);
            return [nextDate, consume(remaining, regex)];
        }
    }

    return [null, remaining];
};

/**
 * Parse time from text (HH:MM, 18 Uhr, 6 PM, etc)
 */
export const parseTime = (text: string): [number | null, number | null, string] => {
    let remaining = text;
    let hours: number | null = null;
    let minutes: number | null = null;

    // HH:MM or HH.MM format
    const timeMatch = remaining.match(/\b(\d{1,2})[:.](\d{2})\b/);
    if (timeMatch) {
        hours = parseInt(timeMatch[1], 10);
        minutes = parseInt(timeMatch[2], 10);
        remaining = consume(remaining, timeMatch[0]);
        return [hours, minutes, remaining];
    }

    // H am/pm format
    const ampmMatch = remaining.match(/\b(\d{1,2})\s*(uhr|am|pm|a\.m\.|p\.m\.)\b/i);
    if (ampmMatch) {
        hours = parseInt(ampmMatch[1], 10);
        const period = ampmMatch[2].toLowerCase();
        if (period.includes('pm') && hours < 12) hours += 12;
        if (period.includes('am') && hours === 12) hours = 0;
        minutes = 0;
        remaining = consume(remaining, ampmMatch[0]);
        return [hours, minutes, remaining];
    }

    // Generic time keywords
    const keywords: { regex: RegExp; h: number }[] = [
        { regex: /\b(morgens?|morning|früh|early|vormittags?|frühstück|breakfast)\b/i, h: 8 },
        { regex: /\b(mittags?|noon|lunch|mittagessen)\b/i, h: 12 },
        { regex: /\b(nachmittags?|afternoon)\b/i, h: 15 },
        { regex: /\b(abends?|evening|tonight|dinner|abendessen)\b/i, h: 19 },
        { regex: /\b(nachts?|night|midnight)\b/i, h: 23 }
    ];

    for (const kw of keywords) {
        if (kw.regex.test(remaining)) {
            hours = kw.h;
            minutes = 0;
            remaining = consume(remaining, kw.regex);
            return [hours, minutes, remaining];
        }
    }

    return [null, null, remaining];
};

/**
 * Apply time to a date
 */
export const applyTime = (date: Date, hours: number, minutes: number): Date => {
    return setHours(setMinutes(date, minutes), hours);
};
