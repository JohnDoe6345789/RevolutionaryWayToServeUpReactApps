import type { Action } from './messaging';
import type { Dispatch } from './dispatch';
import type { MiddlewareAPI } from './middleware-api';

export type Middleware<S, A extends Action> = (
  api: MiddlewareAPI<S, A>,
) => (next: Dispatch<A>) => (action: Readonly<A>) => void;
