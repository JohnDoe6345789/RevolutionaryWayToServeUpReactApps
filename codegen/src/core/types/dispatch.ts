import type { Action } from './messaging';

export type Dispatch<A extends Action> = (action: Readonly<A>) => void;
