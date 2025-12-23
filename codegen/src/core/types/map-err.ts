/**
 * Maps an error Result to a new error
 * @param result
 * @param fn
 */

import type { Result } from './result';
import { isErr } from './is-err';
import { err } from './err';

export function mapErr<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> {
  return isErr(result) ? err(fn(result.error)) : result;
}
