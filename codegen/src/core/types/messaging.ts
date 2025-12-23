// Internal Messaging Service Types
// Redux-like store pattern for inter-class communication

export type Action<T extends string = string, P = unknown> = Readonly<{
  type: T;
  payload?: P;
  meta?: Record<string, unknown>;
}>;
