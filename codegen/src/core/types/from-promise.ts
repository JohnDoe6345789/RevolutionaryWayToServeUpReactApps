/**
 * Converts a Promise<Result> to Result<Promise> for async operations
 * @param promise
 */

import type { ResultAsync } from './result-async';
import { ok } from './ok';
import { err } from './err';

export async function fromPromise<T>(promise: Promise<T>): ResultAsync<T> {
  try {
    const data = await promise;
    return ok(data);
  } catch (error) {
    return err(error instanceof Error ? error : new Error(String(error)));
  }
}
