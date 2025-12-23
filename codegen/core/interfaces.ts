// AGENTS.md compliant TypeScript interfaces
// Strict typing with no 'any' types

export interface ISearchMetadata {
  readonly title: string;
  readonly summary: string;
  readonly keywords: readonly string[];
  readonly tags?: readonly string[];
  readonly aliases?: readonly string[];
  readonly domain: string;
  readonly capabilities: readonly string[];
}

export interface ISpec {
  readonly uuid: string;
  readonly id: string;
  readonly type: string;
  readonly search: ISearchMetadata;
  readonly install?: Record<string, Record<string, readonly string[]>>;
  readonly verify?: Record<string, readonly string[]>;
  readonly help?: Record<string, readonly string[]>;
  readonly oneLiners?: ReadonlyArray<{ id: string; description: string; platforms: Record<string, boolean>; command: readonly string[] }>;
  readonly options?: ReadonlyArray<{ flag: string; description: string; platforms: Record<string, boolean> }>;
  readonly dependencies?: readonly string[];
  readonly risks?: { destructive?: boolean; network?: boolean; confirmation?: string };
  readonly [key: string]: unknown;
}

export interface IPluginConfig {
  readonly name: string;
  readonly description: string;
  readonly version: string;
  readonly author: string;
  readonly category: string;
  readonly dependencies?: readonly string[];
  readonly keywords?: readonly string[];
  readonly capabilities?: readonly string[];
  readonly tags?: readonly string[];
  readonly aliases?: readonly string[];
  readonly domain?: string;
  readonly [key: string]: unknown;
}

export interface IComponent {
  readonly uuid: string;
  readonly id: string;
  readonly search: ISearchMetadata;
  readonly spec: ISpec;

  initialise(): Promise<IComponent>;
  execute(context: Record<string, unknown>): Promise<unknown>;
  validate(input: unknown): boolean;
}

export interface IRegistry {
  readonly listIds: () => readonly string[];
  readonly get: (idOrUuid: string) => IComponent | null;
  readonly describe: (idOrUuid: string) => ISearchMetadata | null;
}

export interface IAggregate {
  readonly listChildren: () => readonly string[];
  readonly getChild: (idOrUuid: string) => IAggregate | IRegistry | null;
  readonly describe: () => ISearchMetadata | null;
}

export interface IPlugin extends IComponent {
  readonly config: IPluginConfig;

  getSpec(): Promise<ISpec>;
  getMessages(): Promise<Record<string, Record<string, string>>>;
  register(registryManager: IRegistryManager): Promise<void>;
  shutdown(): Promise<void>;
}

export interface IRegistryManager {
  register(type: string, id: string, component: IComponent): void;
  getRegistry(type: string): IRegistry;
  getAggregate(name: string): IAggregate;
}

export interface IDependencyInjectionContainer {
  register<T>(token: string | symbol, implementation: new (...args: never[]) => T): void;
  resolve<T>(token: string | symbol): T;
  has(token: string | symbol): boolean;
}

export interface IAdapter {
  execute(command: readonly string[], options?: { cwd?: string; env?: Record<string, string> }): Promise<{ stdout: string; stderr: string; exitCode: number }>;
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  exists(path: string): Promise<boolean>;
}

export type LifecycleState = 'uninitialized' | 'initializing' | 'ready' | 'executing' | 'shutdown';

export interface ILifecycleManager {
  getState(component: IComponent): LifecycleState;
  canTransition(component: IComponent, newState: LifecycleState): boolean;
  transition(component: IComponent, newState: LifecycleState): void;
}
