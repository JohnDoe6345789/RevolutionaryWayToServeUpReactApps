/**
 * Creates a failed Result
 * @param error
 */

import type { Result } from './result';

export function err<E>(error: E): Result<never, E> {
  return { success: false, error };
}
