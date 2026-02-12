/**
 * Clean the title by removing detected parsing patterns
 */

export const cleanTitle = (text: string): string => {
    let title = text.trim();

    // Remove punctuation at edges
    title = title.replace(/^([,.\- ]+)|([,.\- ]+)$/g, '').trim();

    // Remove dangling prepositions
    title = title.replace(/\b(am|um|im|in|zum|zur|beim|für|mit|ab|bis|on|at|ins)\s*$/i, '').trim();
    title = title.replace(/^\s*(am|um|im|in|zum|zur|beim|für|mit|ab|bis|on|at|ins)\s+/i, '').trim();

    // Capitalize first letter
    if (title.length > 0) {
        title = title.charAt(0).toUpperCase() + title.slice(1);
    }

    return title || 'Aufgabe';
};
