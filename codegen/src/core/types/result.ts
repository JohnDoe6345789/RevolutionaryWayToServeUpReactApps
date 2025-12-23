/**
 * Result<T, E> type for functional error handling
 * Inspired by Rust's Result type - eliminates exceptions and provides type-safe error handling
 */

export type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };
