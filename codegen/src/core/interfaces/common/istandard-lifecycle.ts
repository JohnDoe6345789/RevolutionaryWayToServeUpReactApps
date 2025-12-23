/**
 * IStandardLifecycle - Mandatory contract for all components
 * Defines the standard lifecycle methods that all components must implement
 * Based on docs-viewer core principles
 */

export enum LifecycleStatus {
  UNINITIALIZED = 'uninitialized',
  INITIALIZING = 'initializing',
  VALIDATING = 'validating',
  READY = 'ready',
  EXECUTING = 'executing',
  CLEANING = 'cleaning',
  ERROR = 'error',
  DESTROYED = 'destroyed'
}

/**
 * IStandardLifecycle interface - All components MUST implement this
 * Required methods: initialise, validate, execute, cleanup, debug, reset, status
 */
export interface IStandardLifecycle {
  /**
   * initialise() - Called after construction, register with dependency registry
   */
  initialise(): Promise<void> | void;

  /**
   * validate() - Pre-flight checks before execution, fail fast if possible
   */
  validate(): Promise<void> | void;

  /**
   * execute() - Primary operational method, return values via internal messaging service
   */
  execute(): Promise<unknown> | unknown;

  /**
   * cleanup() - Resource cleanup and shutdown, should be idempotent
   */
  cleanup(): Promise<void> | void;

  /**
   * debug() - Return diagnostic data for troubleshooting
   */
  debug(): Record<string, unknown>;

  /**
   * reset() - Reset component to initial state, useful for testing
   */
  reset(): Promise<void> | void;

  /**
   * status() - Return current lifecycle status
   */
  status(): LifecycleStatus;
}
