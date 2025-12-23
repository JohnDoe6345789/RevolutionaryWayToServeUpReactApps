import type { Action } from './messaging';

export type Reducer<S, A extends Action> = (state: Readonly<S>, action: Readonly<A>) => S;
