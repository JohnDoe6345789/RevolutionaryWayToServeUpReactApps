// Comprehensive test suite for NetworkService class
const NetworkService = require("../../../../bootstrap/services/cdn/network-service.js");

// Simple mock function implementation for Bun
function createMockFunction() {
  const mockFn = (...args) => {
    mockFn.calls.push(args);
    return mockFn.returnValue;
  };
  mockFn.calls = [];
  mockFn.returnValue = undefined;
  mockFn.mockReturnValue = (value) => {
    mockFn.returnValue = value;
    return mockFn;
  };
  return mockFn;
}

describe("NetworkService", () => {
  let originalConsole;
  let originalWindow;
  let originalNavigator;

  beforeEach(() => {
    originalConsole = global.console;
    originalWindow = global.window;
    originalNavigator = global.navigator;
  });

  afterEach(() => {
    global.console = originalConsole;
    global.window = originalWindow;
    global.navigator = originalNavigator;
  });

  describe("constructor", () => {
    test("should create an instance with provided config", () => {
      const mockConfig = { test: "value" };
      const service = new NetworkService(mockConfig);
      
      expect(service).toBeInstanceOf(NetworkService);
      expect(service.config).toBe(mockConfig);
    });

    test("should create an instance with default config when none provided", () => {
      const serviceWithDefault = new NetworkService();
      expect(serviceWithDefault).toBeInstanceOf(NetworkService);
      expect(serviceWithDefault.config).toBeDefined();
    });
  });

  describe("initialize method", () => {
    test("should properly initialize all internal services", () => {
      const mockLogClient = createMockFunction();
      const mockWait = createMockFunction();
      
      const config = {
        namespace: { helpers: {} },
        logClient: mockLogClient,
        wait: mockWait,
        providerConfig: { fallbackProviders: ["https://test.com"] },
        probeConfig: { timeout: 5000 },
        moduleResolverConfig: { maxRetries: 3 }
      };
      
      const service = new NetworkService(config);
      const result = service.initialize();
      
      expect(result).toBe(service);
      expect(service.initialized).toBe(true);
      expect(service.providerService).toBeDefined();
      expect(service.probeService).toBeDefined();
      expect(service.moduleResolver).toBeDefined();
      expect(service.namespace).toBe(config.namespace);
      expect(service.helpers).toBe(config.namespace.helpers);
      expect(service.logClient).toBe(mockLogClient);
      expect(service.wait).toBe(mockWait);
    });

    test("should throw if initialized twice", () => {
      const service = new NetworkService();
      service.initialize();

      expect(() => {
        service.initialize();
      }).toThrow();
    });
  });

  describe("_prepareContext method", () => {
    test("should set up the internal context properly", () => {
      const config = {
        namespace: { helpers: { existing: "helper" } },
        isCommonJs: true,
        logClient: createMockFunction(),
        wait: createMockFunction()
      };
      
      const service = new NetworkService(config);
      service._prepareContext();
      
      expect(service.namespace).toBe(config.namespace);
      expect(service.helpers).toBe(config.namespace.helpers);
      expect(service.isCommonJs).toBe(true);
      expect(service.logClient).toBe(config.logClient);
      expect(service.wait).toBe(config.wait);
    });

    test("should use default logClient and wait if not provided", () => {
      const config = {
        namespace: { helpers: {} }
      };
      
      const service = new NetworkService(config);
      service._prepareContext();
      
      expect(typeof service.logClient).toBe("function");
      expect(typeof service.wait).toBe("function");
      
      // Test that default functions work
      expect(() => service.logClient()).not.toThrow();
      expect(() => service.wait()).not.toThrow();
    });
  });

  describe("_initializeServices method", () => {
    test("should initialize all three service types", () => {
      const config = {
        namespace: { helpers: {} },
        providerConfig: { fallbackProviders: ["https://test.com"] },
        probeConfig: { timeout: 5000 },
        moduleResolverConfig: { maxRetries: 3 }
      };
      
      const service = new NetworkService(config);
      service._prepareContext();
      service._initializeServices();
      
      expect(service.providerService).toBeDefined();
      expect(service.probeService).toBeDefined();
      expect(service.moduleResolver).toBeDefined();
      
      // Check that services have been initialized
      expect(service.providerService.initialized).toBe(true);
      expect(service.probeService.initialized).toBe(true);
      expect(service.moduleResolver.initialized).toBe(true);
    });
  });

  describe("_initializeProviderService method", () => {
    test("should initialize provider service with correct config", () => {
      const config = {
        namespace: { helpers: {} },
        providerConfig: { fallbackProviders: ["https://test.com"] }
      };
      
      const service = new NetworkService(config);
      service._prepareContext();
      service._initializeProviderService();
      
      expect(service.providerService).toBeDefined();
      expect(service.providerService.initialized).toBe(true);
    });
  });

  describe("_initializeProbeService method", () => {
    test("should initialize probe service with correct config", () => {
      const mockLogClient = createMockFunction();
      const mockWait = createMockFunction();
      
      const config = {
        namespace: { helpers: {} },
        logClient: mockLogClient,
        wait: mockWait,
        probeConfig: { timeout: 5000 }
      };
      
      const service = new NetworkService(config);
      service._prepareContext();
      service._initializeProbeService();
      
      expect(service.probeService).toBeDefined();
      expect(service.probeService.initialized).toBe(true);
    });
  });

  describe("_initializeModuleResolver method", () => {
    test("should initialize module resolver with correct config", () => {
      const mockLogClient = createMockFunction();
      
      // Initialize dependent services first
      const config = {
        namespace: { helpers: {} },
        logClient: mockLogClient,
        providerConfig: { fallbackProviders: ["https://test.com"] },
        probeConfig: { timeout: 5000 }
      };
      
      const service = new NetworkService(config);
      service._prepareContext();
      service._initializeProviderService();
      service._initializeProbeService();
      service._initializeModuleResolver();
      
      expect(service.moduleResolver).toBeDefined();
      expect(service.moduleResolver.initialized).toBe(true);
    });
  });

  describe("_bindExports method", () => {
    test("should bind all provider service methods", () => {
      const config = {
        namespace: { helpers: {} },
        providerConfig: { fallbackProviders: ["https://test.com"] },
        probeConfig: { timeout: 5000 },
        moduleResolverConfig: { maxRetries: 3 }
      };
      
      const service = new NetworkService(config);
      service.initialize();
      
      // Check that provider service methods are bound
      expect(typeof service.setFallbackProviders).toBe("function");
      expect(typeof service.getFallbackProviders).toBe("function");
      expect(typeof service.setDefaultProviderBase).toBe("function");
      expect(typeof service.getDefaultProviderBase).toBe("function");
      expect(typeof service.setProviderAliases).toBe("function");
      expect(typeof service.normalizeProxyMode).toBe("function");
      expect(typeof service.getProxyMode).toBe("function");
      expect(typeof service.isCiLikeHost).toBe("function");
      expect(typeof service.normalizeProviderBase).toBe("function");
      expect(typeof service.normalizeProviderBaseRaw).toBe("function");
      expect(typeof service.resolveProvider).toBe("function");
    });

    test("should bind all probe service methods", () => {
      const config = {
        namespace: { helpers: {} },
        providerConfig: { fallbackProviders: ["https://test.com"] },
        probeConfig: { timeout: 5000 },
        moduleResolverConfig: { maxRetries: 3 }
      };
      
      const service = new NetworkService(config);
      service.initialize();
      
      // Check that probe service methods are bound
      expect(typeof service.loadScript).toBe("function");
      expect(typeof service.shouldRetryStatus).toBe("function");
      expect(typeof service.probeUrl).toBe("function");
    });

    test("should bind all module resolver methods", () => {
      const config = {
        namespace: { helpers: {} },
        providerConfig: { fallbackProviders: ["https://test.com"] },
        probeConfig: { timeout: 5000 },
        moduleResolverConfig: { maxRetries: 3 }
      };
      
      const service = new NetworkService(config);
      service.initialize();
      
      // Check that module resolver methods are bound
      expect(typeof service.resolveModuleUrl).toBe("function");
    });
  });

  describe("bound service methods functionality", () => {
    test("should be able to call bound provider service methods", () => {
      const config = {
        namespace: { helpers: {} },
        providerConfig: { fallbackProviders: ["https://test.com"] },
        probeConfig: { timeout: 5000 },
        moduleResolverConfig: { maxRetries: 3 }
      };
      
      const service = new NetworkService(config);
      service.initialize();
      
      // These should not throw errors since the methods are bound
      expect(() => service.getFallbackProviders()).not.toThrow();
      expect(() => service.getProxyMode()).not.toThrow();
    });

    test("should be able to call bound probe service methods", () => {
      const config = {
        namespace: { helpers: {} },
        providerConfig: { fallbackProviders: ["https://test.com"] },
        probeConfig: { timeout: 5000 },
        moduleResolverConfig: { maxRetries: 3 }
      };
      
      const service = new NetworkService(config);
      service.initialize();
      
      // These should not throw errors since the methods are bound
      expect(() => service.shouldRetryStatus(200)).not.toThrow();
    });

    test("should be able to call bound module resolver methods", () => {
      const config = {
        namespace: { helpers: {} },
        providerConfig: { fallbackProviders: ["https://test.com"] },
        probeConfig: { timeout: 5000 },
        moduleResolverConfig: { maxRetries: 3 }
      };
      
      const service = new NetworkService(config);
      service.initialize();
      
      // This should not throw errors since the method is bound
      expect(() => service.resolveModuleUrl("test-module")).not.toThrow();
    });
  });
});