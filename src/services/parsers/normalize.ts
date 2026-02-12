/**
 * Normalize input text for parsing
 */

const UMLAUT_MAP: { [key: string]: string } = {
    'ä': 'ae', 'ö': 'oe', 'ü': 'ue',
    'Ä': 'AE', 'Ö': 'OE', 'Ü': 'UE',
    'ß': 'ss'
};

export const removeUmlauts = (text: string): string => {
    return text.split('').map(char => UMLAUT_MAP[char] || char).join('');
};

export const normalize = (input: string): string => {
    return input
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ');
};

export const normalizeForComparison = (input: string): string => {
    return removeUmlauts(normalize(input));
};

/**
 * Remove a pattern and clean up extra spaces/prepositions
 */
export const consume = (text: string, pattern: RegExp | string): string => {
    let result = text.replace(pattern, ' ').trim();
    // Clean up dangling prepositions
    result = result.replace(/\s+(am|um|im|in|zum|zur|beim|für|mit|ab|bis|on|at|ins)\s*$/i, '');
    result = result.replace(/^\s*(am|um|im|in|zum|zur|beim|für|mit|ab|bis|on|at|ins)\s+/i, '');
    result = result.replace(/\s+/g, ' ').trim();
    return result;
};
