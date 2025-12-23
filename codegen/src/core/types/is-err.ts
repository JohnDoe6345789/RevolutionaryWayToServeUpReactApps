/**
 * Type guard to check if Result is an error
 * @param result
 */

import type { Result } from './result';

export function isErr<T, E>(result: Result<T, E>): result is { success: false; error: E } {
  return !result.success;
}
