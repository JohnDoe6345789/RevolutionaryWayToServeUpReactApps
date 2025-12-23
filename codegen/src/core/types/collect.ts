/**
 * Collects multiple Results into a single Result of arrays
 * @param results
 */

import type { Result } from './result';
import { isErr } from './is-err';
import { ok } from './ok';

export function collect<T, E>(results: Result<T, E>[]): Result<T[], E> {
  const values: T[] = [];
  for (const result of results) {
    if (isErr(result)) {
      return result;
    }
    values.push(result.data);
  }
  return ok(values);
}
