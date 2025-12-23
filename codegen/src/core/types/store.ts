import type { Action } from './messaging';
import type { Unsubscribe } from './unsubscribe';

export type Store<S, A extends Action> = Readonly<{
  getState: () => Readonly<S>;
  dispatch: (action: Readonly<A>) => void;
  subscribe: (listener: () => void) => Unsubscribe;
}>;
