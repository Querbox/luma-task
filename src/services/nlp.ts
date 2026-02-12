/**
 * Main NLP entry point - uses modular parsers
 */

import { parseTask } from './parsers';
import type { ParsedTask } from './parsers';

// Re-export for backward compatibility
export { parseTask as parseTaskInput };

export default parseTask;
