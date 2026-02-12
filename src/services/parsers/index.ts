import { normalize } from './normalize';
import { parseRecurrence } from './recurrence';
import type { Recurrence } from './recurrence';
import { parseRelativeDate, parseWeekdayDate, parseTime, applyTime } from './dateParser';
import { cleanTitle } from './titleCleaner';

export interface ParsedTask {
    title: string;
    date: Date | null;
    time: string | null;
    recurrence: Recurrence | null;
    icon?: string;
    tags?: string[];
}

/**
 * Extract tags from task
 */
const KEYWORDS: { [key: string]: string } = {
    'frühstück': 'Frühstück', 'breakfast': 'Frühstück',
    'mittag': 'Mittagessen', 'lunch': 'Mittagessen',
    'abendessen': 'Abendessen', 'dinner': 'Abendessen',
    'gym': 'Fitness', 'fitness': 'Fitness', 'sport': 'Fitness', 'training': 'Fitness',
    'termin': 'Termin', 'appointment': 'Termin', 'meeting': 'Termin',
    'arbeit': 'Arbeit', 'work': 'Arbeit',
    'hausaufgaben': 'Lernen', 'lernen': 'Lernen', 'study': 'Lernen',
    'einkaufen': 'Einkauf', 'shopping': 'Einkauf'
};

const extractTags = (input: string): string[] => {
    const lower = input.toLowerCase();
    const tags = new Set<string>();
    for (const [key, tag] of Object.entries(KEYWORDS)) {
        if (lower.includes(key)) tags.add(tag);
    }
    return Array.from(tags);
};

/**
 * Extract icon emoji based on keywords
 */
const ICON_MAP: { [key: string]: string } = {
    'gym': '🏋️', 'sport': '🏃', 'yoga': '🧘', 'kochen': '🍳', 'essen': '🍴',
    'einkaufen': '🛒', 'arbeit': '💼', 'meeting': '📅', 'anruf': '📞',
    'lesen': '📚', 'code': '💻', 'putzen': '🧹', 'schlafen': '😴',
    'arzt': '🏥', 'geld': '💰', 'auto': '🚗', 'party': '🎉', 'idee': '💡'
};

const getIconForTitle = (input: string): string | undefined => {
    const lower = input.toLowerCase();
    for (const [key, icon] of Object.entries(ICON_MAP)) {
        if (lower.includes(key)) return icon;
    }
    return undefined;
};

/**
 * Main parsing pipeline
 */
export const parseTask = (input: string): ParsedTask => {
    // Step 1: Normalize
    let text = normalize(input);
    let date: Date | null = null;
    let hours: number | null = null;
    let minutes: number | null = null;

    // Step 2: Parse recurrence
    const [recurrence, afterRecurrence] = parseRecurrence(text);
    text = afterRecurrence;

    // Step 3: Parse date
    const [relativeDate, afterRelative] = parseRelativeDate(text);
    if (relativeDate) {
        date = relativeDate;
        text = afterRelative;
    }

    // Try weekday if no relative date
    if (!date) {
        const [weekdayDate, afterWeekday] = parseWeekdayDate(text);
        if (weekdayDate) {
            date = weekdayDate;
            text = afterWeekday;
        }
    }

    // Step 4: Parse time
    const [parsedHours, parsedMinutes, afterTime] = parseTime(text);
    if (parsedHours !== null) {
        hours = parsedHours;
        minutes = parsedMinutes ?? 0;
        text = afterTime;
    }

    // Apply time to date if both exist
    if (date && hours !== null) {
        date = applyTime(date, hours, minutes ?? 0);
    } else if (date && hours === null) {
        // If date but no time, set a default morning time
        date = applyTime(date, 9, 0);
    }

    // Step 5: Extract metadata
    const tags = extractTags(input);
    const icon = getIconForTitle(input);

    // Step 6: Clean title
    const title = cleanTitle(text);

    // Format time for display if exists
    let timeStr: string | null = null;
    if (hours !== null && minutes !== null) {
        timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }

    return {
        title,
        date,
        time: timeStr,
        recurrence,
        icon,
        tags
    };
};
