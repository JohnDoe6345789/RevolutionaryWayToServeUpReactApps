export = FactoryRegistry;

declare class FactoryRegistry {
  register(name: string, factory: any, metadata: Record<string, unknown>, requiredDependencies: string[]): void;
  create(name: string, dependencies?: Record<string, unknown>): any;
  getFactory(name: string): any | undefined;
  listFactories(): string[];
  getMetadata(name: string): Record<string, unknown> | undefined;
  isRegistered(name: string): boolean;
}