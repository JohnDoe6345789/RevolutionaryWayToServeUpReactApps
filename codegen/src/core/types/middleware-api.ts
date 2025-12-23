import type { Action } from './messaging';
import type { Dispatch } from './dispatch';

export type MiddlewareAPI<S, A extends Action> = Readonly<{
  getState: () => Readonly<S>;
  dispatch: Dispatch<A>;
}>;
