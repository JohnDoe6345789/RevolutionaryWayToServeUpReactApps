export = NetworkServiceConfig;

declare class NetworkServiceConfig {
  constructor(options?: {
    logClient?: (...args: any[]) => void;
    wait?: (ms: number) => Promise<void>;
  });
  logClient?: (...args: any[]) => void;
  wait?: (ms: number) => Promise<void>;
}
