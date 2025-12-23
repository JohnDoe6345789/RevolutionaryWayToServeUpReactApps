/**
 * Result<T, E> type for functional error handling
 * Inspired by Rust's Result type - eliminates exceptions and provides type-safe error handling
 */

export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export type ResultAsync<T, E = Error> = Promise<Result<T, E>>;

/**
 * Creates a successful Result
 */
export function ok<T>(data: T): Result<T, never> {
  return { success: true, data };
}

/**
 * Creates a failed Result
 */
export function err<E>(error: E): Result<never, E> {
  return { success: false, error };
}

/**
 * Type guard to check if Result is successful
 */
export function isOk<T, E>(result: Result<T, E>): result is { success: true; data: T } {
  return result.success;
}

/**
 * Type guard to check if Result is an error
 */
export function isErr<T, E>(result: Result<T, E>): result is { success: false; error: E } {
  return !result.success;
}

/**
 * Unwraps a Result, throwing if it's an error
 * Use sparingly - prefer pattern matching or chaining
 */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (isErr(result)) {
    throw result.error;
  }
  return result.data;
}

/**
 * Unwraps a Result with a default value
 */
export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  return isOk(result) ? result.data : defaultValue;
}

/**
 * Maps a successful Result to a new value
 */
export function map<T, U, E>(result: Result<T, E>, fn: (data: T) => U): Result<U, E> {
  return isOk(result) ? ok(fn(result.data)) : result;
}

/**
 * Maps an error Result to a new error
 */
export function mapErr<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> {
  return isErr(result) ? err(fn(result.error)) : result;
}

/**
 * Chains operations on successful Results
 */
export function andThen<T, U, E>(result: Result<T, E>, fn: (data: T) => Result<U, E>): Result<U, E> {
  return isOk(result) ? fn(result.data) : result;
}

/**
 * Converts a Promise<Result> to Result<Promise> for async operations
 */
export async function fromPromise<T>(promise: Promise<T>): ResultAsync<T, Error> {
  try {
    const data = await promise;
    return ok(data);
  } catch (error) {
    return err(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Collects multiple Results into a single Result of arrays
 */
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
