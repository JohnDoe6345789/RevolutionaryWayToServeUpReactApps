/**
 * ResultAsync<T, E> type for async functional error handling
 */

import type { Result } from './result';

export type ResultAsync<T, E = Error> = Promise<Result<T, E>>;
