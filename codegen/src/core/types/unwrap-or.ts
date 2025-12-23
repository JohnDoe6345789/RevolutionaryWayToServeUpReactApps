/**
 * Unwraps a Result with a default value
 * @param result
 * @param defaultValue
 */

import type { Result } from './result';
import { isOk } from './is-ok';

export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  return isOk(result) ? result.data : defaultValue;
}
