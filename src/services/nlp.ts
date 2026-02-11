import { addDays, setHours, setMinutes, addWeeks, addMonths, nextDay } from 'date-fns';

interface ParsedTask {
    title: string;
    date?: Date;
    recurrence?: {
        type: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom';
        interval?: number;
        daysOfWeek?: number[];
    };
    icon?: string;
    tags?: string[];
}

const TAG_KEYWORDS: { [key: string]: string } = {
    'frühstück': 'Frühstück',
    'breakfast': 'Frühstück',
    'mittag': 'Mittagessen',
    'lunch': 'Mittagessen',
    'abendessen': 'Abendessen',
    'dinner': 'Abendessen',
    'gym': 'Fitness',
    'fitness': 'Fitness',
    'sport': 'Fitness',
    'training': 'Fitness',
    'termin': 'Termin',
    'appointment': 'Termin',
    'meeting': 'Termin',
    'arbeit': 'Arbeit',
    'work': 'Arbeit',
    'hausaufgaben': 'Lernen',
    'lernen': 'Lernen',
    'study': 'Lernen',
    'einkaufen': 'Einkauf',
    'shopping': 'Einkauf'
};

const WEEKDAYS: { [key: string]: number } = {
    'so': 0, 'sonntag': 0, 'sunday': 0, 'sun': 0,
    'mo': 1, 'montag': 1, 'monday': 1, 'mon': 1,
    'di': 2, 'dienstag': 2, 'tuesday': 2, 'tue': 2,
    'mi': 3, 'mittwoch': 3, 'wednesday': 3, 'wed': 3,
    'do': 4, 'donnerstag': 4, 'thursday': 4, 'thu': 4,
    'fr': 5, 'freitag': 5, 'friday': 5, 'fri': 5,
    'sa': 6, 'samstag': 6, 'saturday': 6, 'sat': 6
};

const extractTags = (input: string): string[] => {
    const lower = input.toLowerCase();
    const tags = new Set<string>();
    for (const [key, tag] of Object.entries(TAG_KEYWORDS)) {
        if (lower.includes(key)) tags.add(tag);
    }
    return Array.from(tags);
};

const ICON_MAP: { [key: string]: string } = {
    'gym': '🏋️', 'sport': '🏃', 'yoga': '🧘', 'kochen': '🍳', 'essen': '🍴',
    'einkaufen': '🛒', 'arbeit': '💼', 'meeting': '📅', 'anruf': '📞',
    'lesen': '📚', 'code': '💻', 'putzen': '🧹', 'schlafen': '😴',
    'arzt': '🏥', 'geld': '💰', 'auto': '🚗', 'party': '🎉', 'idee': '💡'
};

const getIconForTitle = (input: string): string | undefined => {
    const lowerInput = input.toLowerCase();
    for (const [key, icon] of Object.entries(ICON_MAP)) {
        if (lowerInput.includes(key)) return icon;
    }
    return undefined;
};

export const parseTaskInput = (input: string): ParsedTask => {
    let title = input;
    let date: Date | undefined = undefined;
    let recurrence: ParsedTask['recurrence'] = undefined;

    const lower = input.toLowerCase();
    const now = new Date();

    const consume = (pattern: RegExp | string) => {
        title = title.replace(pattern, '').trim();
        // Clean up prepositions and connectors
        const preps = /\b(am|um|im|in|at|on|every|jede[nr]?|zum|zur|beim|beon|mit|with|starting|ab|seit|until|bis)\s*$/i;
        title = title.replace(preps, '').trim();
        title = title.replace(/\s+/g, ' ');
    };

    // --- Tags ---
    const tags = extractTags(input);

    // --- Recurrence ---
    if (lower.match(/(jeden tag|täglich|every day|daily)/)) {
        recurrence = { type: 'daily' };
        consume(/(jeden tag|täglich|every day|daily)/i);
    } else if (lower.match(/(jede woche|wöchentlich|every week|weekly)/)) {
        recurrence = { type: 'weekly' };
        consume(/(jede woche|wöchentlich|every week|weekly)/i);
    } else if (lower.match(/(alle zwei wochen|biweekly|every 2 weeks)/)) {
        recurrence = { type: 'biweekly' };
        consume(/(alle zwei wochen|biweekly|every 2 weeks)/i);
    } else if (lower.match(/(jeden monat|monatlich|every month|monthly)/)) {
        recurrence = { type: 'monthly' };
        consume(/(jeden monat|monatlich|every month|monthly)/i);
    }

    // --- Relatives (In X days/weeks) ---
    const inXMatch = lower.match(/\bin\s+(\d+)\s*(tagen?|wochen?|monaten?|days?|weeks?|months?)\b/);
    if (inXMatch) {
        const amount = parseInt(inXMatch[1], 10);
        const unit = inXMatch[2].toLowerCase();
        if (unit.startsWith('tag') || unit.startsWith('day')) date = addDays(now, amount);
        else if (unit.startsWith('woch') || unit.startsWith('week')) date = addWeeks(now, amount);
        else if (unit.startsWith('monat') || unit.startsWith('month')) date = addMonths(now, amount);
        consume(inXMatch[0]);
    }

    // --- Fixed Dates ---
    if (lower.match(/\b(morgen|tomorrow)\b/)) {
        date = addDays(now, 1);
        consume(/\b(morgen|tomorrow)\b/i);
    } else if (lower.match(/\b(übermorgen|next day)\b/)) {
        date = addDays(now, 2);
        consume(/\b(übermorgen|next day)\b/i);
    } else if (lower.match(/\b(heute|today)\b/)) {
        date = now;
        consume(/\b(heute|today)\b/i);
    } else if (lower.match(/\b(wochenende|weekend)\b/)) {
        // Find next Saturday
        date = nextDay(now, 6);
        consume(/\b((dieses|nächstes)?\s*(wochenende|weekend))\b/i);
    }

    // --- Weekdays ---
    for (const [key, dayIdx] of Object.entries(WEEKDAYS)) {
        const regex = new RegExp(`\\b(am|on|nächsten?|nächster|next)?\\s*${key}\\b`, 'i');
        if (regex.test(title)) {
            date = nextDay(now, dayIdx as any);
            consume(regex);
            break;
        }
    }

    // --- Time ---
    const timeMatch = title.match(/\b(\d{1,2})(:|\.)(\d{2})\b/) ||
        title.match(/\b(\d{1,2})\s*(uhr|pm|am)\b/i);

    if (timeMatch) {
        let h = parseInt(timeMatch[1], 10);
        let m = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
        if (timeMatch[0].toLowerCase().includes('pm') && h < 12) h += 12;
        if (timeMatch[0].toLowerCase().includes('am') && h === 12) h = 0;

        if (date) {
            date = setHours(setMinutes(date, m), h);
        } else {
            date = setHours(setMinutes(now, m), h);
            if (date < now) date = addDays(date, 1);
        }
        consume(timeMatch[0]);
    }

    // --- Generic Keywords ---
    const keywords = [
        { regex: /\b(morgens?|morning|früh|early|vormittags?|frühstück)\b/i, h: 8 },
        { regex: /\b(mittags?|noon|lunch|mittagessen)\b/i, h: 12 },
        { regex: /\b(nachmittags?|afternoon)\b/i, h: 15 },
        { regex: /\b(abends?|evening|tonight|dinner|abendessen)\b/i, h: 19 },
        { regex: /\b(nachts?|night|midnight)\b/i, h: 23 }
    ];

    for (const kw of keywords) {
        if (kw.regex.test(lower)) {
            if (!date) date = now;
            if (!timeMatch) date = setHours(setMinutes(date, 0), kw.h);
            consume(kw.regex);
        }
    }

    // --- Cleanup Title ---
    for (const tagKey of Object.keys(TAG_KEYWORDS)) {
        const regex = new RegExp(`\\b(zum|zur|beim|für|for|at|on)?\\s*${tagKey}\\b`, 'i');
        if (regex.test(title)) consume(regex);
    }

    const finalTitle = title.trim()
        .replace(/^([,.\- ]+)|([,.\- ]+)$/g, '')
        .replace(/\b(am|um|im|in|zum|zur|beim|für|for|mit|with|ab|bis|on|at)\s*$/i, '')
        .trim();

    return {
        title: finalTitle || input, // Fallback to raw if empty
        date,
        recurrence,
        icon: getIconForTitle(input),
        tags
    };
};
