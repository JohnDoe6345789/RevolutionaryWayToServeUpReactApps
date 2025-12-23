/**
 * Chains operations on successful Results
 * @param result
 * @param fn
 */

import type { Result } from './result';
import { isOk } from './is-ok';

export function andThen<T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => Result<U, E>,
): Result<U, E> {
  return isOk(result) ? fn(result.data) : result;
}
