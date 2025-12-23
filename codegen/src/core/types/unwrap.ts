/**
 * Unwraps a Result, throwing if it's an error
 * Use sparingly - prefer pattern matching or chaining
 * @param result
 */

import type { Result } from './result';
import { isErr } from './is-err';

export function unwrap<T, E>(result: Result<T, E>): T {
  if (isErr(result)) {
    throw result.error;
  }
  return result.data;
}
