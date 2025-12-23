/**
 * Maps a successful Result to a new value
 * @param result
 * @param fn
 */

import type { Result } from './result';
import { isOk } from './is-ok';
import { ok } from './ok';

export function map<T, U, E>(result: Result<T, E>, fn: (data: T) => U): Result<U, E> {
  return isOk(result) ? ok(fn(result.data)) : result;
}
