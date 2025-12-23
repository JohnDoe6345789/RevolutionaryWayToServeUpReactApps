/**
 * Creates a successful Result
 * @param data
 */

import type { Result } from './result';

export function ok<T>(data: T): Result<T, never> {
  return { success: true, data };
}
