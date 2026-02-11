import { addDays, setHours, setMinutes } from 'date-fns';

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
    'work': 'Arbeit'
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
    'gym': '🏋️',
    'sport': '🏃',
    'laufen': '🏃',
    'yoga': '🧘',
    'kochen': '🍳',
    'essen': '🍴',
    'einkaufen': '🛒',
    'shop': '🛒',
    'arbeit': '💼',
    'work': '💼',
    'meeting': '📅',
    'anruf': '📞',
    'call': '📞',
    'lesen': '📚',
    'read': '📚',
    'code': '💻',
    'programmieren': '💻',
    'putzen': '🧹',
    'clean': '🧹',
    'schlafen': '😴',
    'sleep': '😴',
    'meditieren': '🧘',
    'meditate': '🧘',
    'arzt': '🏥',
    'doctor': '🏥',
    'versicherung': '📄',
    'bank': '🏦',
    'geld': '💰',
    'money': '💰'
};

const getIconForTitle = (title: string): string | undefined => {
    const lowerTitle = title.toLowerCase();
    for (const [key, icon] of Object.entries(ICON_MAP)) {
        if (lowerTitle.includes(key)) return icon;
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
        // Clean up prepositions
        title = title.replace(/\b(am|um|im|in|at|on|every|jede[nr]?|zum|zur|beim|beon)\s*$/i, '');
        title = title.replace(/\s+/g, ' ');
    };

    // --- Tags (Pre-extraction) ---
    const tags = extractTags(input);

    // --- Recurrence ---
    const dailyMatch = lower.match(/(jeden tag|täglich|every day|daily)/);
    const weeklyMatch = lower.match(/(jede woche|wöchentlich|every week|weekly)/);

    if (dailyMatch) {
        recurrence = { type: 'daily' };
        consume(dailyMatch[0]);
    } else if (weeklyMatch) {
        recurrence = { type: 'weekly' };
        consume(weeklyMatch[0]);
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

    // Keywords (morgens, abends, etc.)
    if (lower.match(/\b(morgens|morning|früh)\b/)) {
        if (!date) date = addDays(now, 1);
        // If time was already set (e.g. 7 Uhr morgens), don't override h/m but keep date
        if (!timeMatch) {
            date = setHours(setMinutes(date, 0), 8);
        }
        consume(/\b(morgens|morning|früh|am morgen|in der früh)\b/i);
    } else if (lower.match(/\b(abends|evening|tonight)\b/)) {
        if (!date) date = now;
        if (!timeMatch) {
            date = setHours(setMinutes(date, 0), 19);
        }
        consume(/\b(abends|evening|tonight|am abend)\b/i);
    }

    // Cleanup Tag Keywords from Title if they are just descriptive
    for (const key of Object.keys(TAG_KEYWORDS)) {
        const regex = new RegExp(`\\b(zum|zur|beim|für|for|at|on)?\\s*${key}\\b`, 'i');
        if (regex.test(title)) {
            consume(regex);
        }
    }

    const finalTitle = title.trim()
        .replace(/^([,.\- ]+)|([,.\- ]+)$/g, '')
        .replace(/\b(am|um|im|in|zum|zur|beim)\s*$/i, '')
        .trim();

    return {
        title: finalTitle,
        date,
        recurrence,
        icon: getIconForTitle(input), // Use full input for icon detection
        tags
    };
};
