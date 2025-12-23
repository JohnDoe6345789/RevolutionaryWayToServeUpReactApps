/**
 * Interfaces index - exports all AGENTS.md compliant interfaces
 * One interface per file for clean separation and maintainability
 * Now organized into domain-specific subdirectories
 */

// Aggregation interfaces
export { IAggregate } from './aggregation/iaggregate';
export { IAggregator } from './aggregation/iaggregator';
export { IAggregateResults } from './aggregation/iaggregate-results';

// Codegen interfaces
export { IBaseCodegenOptions } from './codegen/ibase-codegen-options';
export { ICodegenExecutionResults } from './codegen/icodegen-execution-results';

// Common interfaces
export { IAdapter } from './common/iadapter';
export { IComponent } from './common/icomponent';
export { IDependencyInjectionContainer } from './common/idependency-injection-container';
export { ILifecycleManager } from './common/ilifecycle-manager';
export { LifecycleState } from './common/lifecycle-state';

// Plugin interfaces
export { IPlugin } from './plugins/iplugin';
export { IPluginConfig } from './plugins/iplugin-config';
export { IPluginExecutionResult } from './plugins/iplugin-execution-result';
export { IPluginInfo } from './plugins/iplugin-info';
export { IPluginRegistryManager } from './plugins/iplugin-registry-manager';

// Registry interfaces
export { IRegistry } from './registry/iregistry';
export { IRegistryManager } from './registry/iregistry-manager';

// Search interfaces
export { ISearchMetadata } from './search/isearch-metadata';
export { ISearchMetadataForValidation } from './search/isearch-metadata-for-validation';

// Spec interfaces
export { ISpec } from './specs/ispec';
export { ISpecForValidation } from './specs/ispec-for-validation';
export { ISpecValidatorOptions } from './specs/ispec-validator-options';

// System interfaces
export { ISystemStatus } from './system/isystem-status';
export { IValidationResult } from './system/ivalidation-result';
