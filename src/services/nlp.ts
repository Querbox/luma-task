/**
 * Main NLP entry point - uses modular parsers
 */

import { parseTask } from './parsers';
import type { ParsedTask as _ParsedTask } from './parsers';
export type { _ParsedTask as ParsedTask };

// Re-export for backward compatibility
export { parseTask as parseTaskInput };

export default parseTask;
