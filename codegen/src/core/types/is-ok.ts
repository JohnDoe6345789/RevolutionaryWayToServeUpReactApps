/**
 * Type guard to check if Result is successful
 * @param result
 */

import type { Result } from './result';

export function isOk<T, E>(result: Result<T, E>): result is { success: true; data: T } {
  return result.success;
}
