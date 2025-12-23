/**
 * Lifecycle module - AGENTS.md compliant component orchestration
 * Exports the LifecycleBuilder for declarative component composition
 */

export { LifecycleBuilder } from './lifecycle-builder';
export type {
  IStandardLifecycle,
  LifecycleBuilder as ILifecycleBuilder,
  CompositeLifecycle,
} from '../types/lifecycle';
export { LifecycleStatus } from '../types/lifecycle';
