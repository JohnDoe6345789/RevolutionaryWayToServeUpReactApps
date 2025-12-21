import LocalRequireBuilder from "../../../../../bootstrap/services/local/local-require-builder.js";

// Mock helper registry for testing
class MockHelperRegistry {
  constructor() {
    this.registeredHelpers = new Map();
  }
  
  register(name, helper, metadata) {
    this.registeredHelpers.set(name, { helper, metadata });
  }
  
  isRegistered(name) {
    return this.registeredHelpers.has(name);
  }
  
  getHelper(name) {
    const entry = this.registeredHelpers.get(name);
    return entry ? entry.helper : null;
  }
}

describe("LocalRequireBuilder", () => {
  let localRequireBuilder;
  let mockHelperRegistry;

  beforeEach(() => {
    mockHelperRegistry = new MockHelperRegistry();
    const config = { helperRegistry: mockHelperRegistry };
    localRequireBuilder = new LocalRequireBuilder(config);
  });

  describe("constructor", () => {
    it("should initialize with provided config", () => {
      expect(localRequireBuilder.config).toBeDefined();
      expect(localRequireBuilder.config.helperRegistry).toBe(mockHelperRegistry);
      expect(localRequireBuilder.initialized).toBe(false);
    });

    it("should accept a plain config object", () => {
      const plainConfig = { helperRegistry: mockHelperRegistry };
      const builder = new LocalRequireBuilder(plainConfig);
      
      expect(builder.config.helperRegistry).toBe(mockHelperRegistry);
    });

    it("should use default config when none provided", () => {
      const builder = new LocalRequireBuilder();
      expect(builder.config).toBeDefined();
    });
  });

  describe("initialize method", () => {
    it("should set up internal properties", () => {
      const mockLoadDynamicModule = jest.fn();
      const mockIsLocalModule = jest.fn();
      
      localRequireBuilder.initialize({ 
        loadDynamicModule: mockLoadDynamicModule,
        isLocalModule: mockIsLocalModule
      });
      
      expect(localRequireBuilder.loadDynamicModule).toBe(mockLoadDynamicModule);
      expect(localRequireBuilder.isLocalModule).toBe(mockIsLocalModule);
      expect(localRequireBuilder.initialized).toBe(true);
    });

    it("should register itself with the helper registry", () => {
      localRequireBuilder.initialize({ 
        loadDynamicModule: jest.fn(),
        isLocalModule: jest.fn()
      });
      
      expect(mockHelperRegistry.isRegistered("localRequireBuilderInstance")).toBe(true);
      const registered = mockHelperRegistry.getHelper("localRequireBuilderInstance");
      expect(registered).toBe(localRequireBuilder);
    });

    it("should not register if no helper registry is provided", () => {
      const builder = new LocalRequireBuilder({}); // No helperRegistry
      builder.initialize({ 
        loadDynamicModule: jest.fn(),
        isLocalModule: jest.fn()
      });
      
      // No registration should happen since no registry was provided
      expect(mockHelperRegistry.isRegistered("localRequireBuilderInstance")).toBe(false);
    });

    it("should throw if already initialized", () => {
      const mockLoadDynamicModule = jest.fn();
      const mockIsLocalModule = jest.fn();
      
      localRequireBuilder.initialize({ 
        loadDynamicModule: mockLoadDynamicModule,
        isLocalModule: mockIsLocalModule
      });
      
      expect(() => {
        localRequireBuilder.initialize({ 
          loadDynamicModule: mockLoadDynamicModule,
          isLocalModule: mockIsLocalModule
        });
      }).toThrow("LocalRequireBuilder already initialized");
    });

    it("should return the instance to allow chaining", () => {
      const mockLoadDynamicModule = jest.fn();
      const mockIsLocalModule = jest.fn();
      
      const result = localRequireBuilder.initialize({ 
        loadDynamicModule: mockLoadDynamicModule,
        isLocalModule: mockIsLocalModule
      });
      
      expect(result).toBe(localRequireBuilder);
    });
  });

  describe("create method", () => {
    beforeEach(() => {
      localRequireBuilder.initialize({ 
        loadDynamicModule: jest.fn(),
        isLocalModule: jest.fn().mockReturnValue(true)
      });
    });

    it("should create a require function with async method", () => {
      const registry = { testModule: { name: "test" } };
      const requireFn = localRequireBuilder.create({
        registry,
        config: {},
        entryDir: "",
        localModuleLoader: null,
        dynamicModuleLoader: null
      });
      
      expect(typeof requireFn).toBe("function");
      expect(typeof requireFn._async).toBe("function");
    });

    it("should return existing modules from registry", () => {
      const testModule = { name: "test" };
      const registry = { testModule };
      
      const requireFn = localRequireBuilder.create({
        registry,
        config: {},
        entryDir: "",
        localModuleLoader: null,
        dynamicModuleLoader: null
      });
      
      const result = requireFn("testModule");
      
      expect(result).toBe(testModule);
    });

    it("should throw error for missing modules", () => {
      const registry = {};
      
      const requireFn = localRequireBuilder.create({
        registry,
        config: {},
        entryDir: "",
        localModuleLoader: null,
        dynamicModuleLoader: null
      });
      
      expect(() => requireFn("missingModule")).toThrow("Module not yet loaded: missingModule (use a preload step via requireAsync for dynamic modules)");
    });

    it("should handle local module loading via localModuleLoader", async () => {
      const registry = {};
      const localModuleLoader = jest.fn().mockResolvedValue({ loaded: true });
      const mockRequireFn = jest.fn();
      
      const requireFn = localRequireBuilder.create({
        registry,
        config: {},
        entryDir: "/path/",
        localModuleLoader,
        dynamicModuleLoader: null,
        argumentCount: 0
      });
      
      const result = await requireFn._async("./local-module", "/path/");
      
      expect(localModuleLoader).toHaveBeenCalledWith(
        "./local-module",
        "/path/",
        expect.any(Function), // requireFn
        registry
      );
      expect(result).toEqual({ loaded: true });
    });

    it("should handle dynamic module loading via dynamicModuleLoader", async () => {
      const registry = {};
      const dynamicModuleLoader = jest.fn().mockResolvedValue({ dynamic: true });
      const config = { 
        dynamicModules: [
          { prefix: "dynamic:" }
        ] 
      };
      
      const requireFn = localRequireBuilder.create({
        registry,
        config,
        entryDir: "",
        localModuleLoader: null,
        dynamicModuleLoader,
        argumentCount: 0
      });
      
      const result = await requireFn._async("dynamic:module", "");
      
      expect(dynamicModuleLoader).toHaveBeenCalledWith(
        "dynamic:module",
        config,
        registry
      );
      expect(result).toEqual({ dynamic: true });
    });

    it("should throw error for unregistered modules", async () => {
      const registry = {};
      
      const requireFn = localRequireBuilder.create({
        registry,
        config: {},
        entryDir: "",
        localModuleLoader: null,
        dynamicModuleLoader: null,
        argumentCount: 0
      });
      
      await expect(requireFn._async("unregistered-module", ""))
        .rejects.toThrow("Module not registered: unregistered-module");
    });

    it("should throw if not initialized before calling create", () => {
      const freshBuilder = new LocalRequireBuilder({ helperRegistry: mockHelperRegistry });
      
      expect(() => freshBuilder.create({}))
        .toThrow("LocalRequireBuilder not initialized");
    });
  });

  describe("_createRequire method", () => {
    it("should return a function that retrieves modules from registry", () => {
      const registry = { test: { value: "test" } };
      const requireFn = localRequireBuilder._createRequire(registry);
      
      const result = requireFn("test");
      
      expect(result).toEqual({ value: "test" });
    });

    it("should throw error when module is not in registry", () => {
      const registry = {};
      const requireFn = localRequireBuilder._createRequire(registry);
      
      expect(() => requireFn("missing")).toThrow("Module not yet loaded: missing (use a preload step via requireAsync for dynamic modules)");
    });
  });

  describe("_createRequireAsync method", () => {
    beforeEach(() => {
      localRequireBuilder.initialize({ 
        loadDynamicModule: jest.fn(),
        isLocalModule: jest.fn().mockReturnValue(true)
      });
    });

    it("should return a function that retrieves modules from registry", async () => {
      const registry = { test: { value: "test" } };
      const requireAsync = localRequireBuilder._createRequireAsync({
        registry,
        config: {},
        resolvedEntryDir: "",
        localModuleLoader: null,
        resolvedDynamicModuleLoader: null,
        requireFn: jest.fn()
      });
      
      const result = await requireAsync("test");
      
      expect(result).toEqual({ value: "test" });
    });

    it("should handle local module loading", async () => {
      const registry = {};
      const localModuleLoader = jest.fn().mockResolvedValue({ loaded: true });
      const requireFn = jest.fn();
      
      const requireAsync = localRequireBuilder._createRequireAsync({
        registry,
        config: {},
        resolvedEntryDir: "/path/",
        localModuleLoader,
        resolvedDynamicModuleLoader: null,
        requireFn
      });
      
      const result = await requireAsync("./local-module", "/path/");
      
      expect(localModuleLoader).toHaveBeenCalledWith(
        "./local-module",
        "/path/",
        requireFn,
        registry
      );
      expect(result).toEqual({ loaded: true });
    });

    it("should handle dynamic module loading", async () => {
      const registry = {};
      const dynamicModuleLoader = jest.fn().mockResolvedValue({ dynamic: true });
      const config = { 
        dynamicModules: [
          { prefix: "dynamic:" }
        ] 
      };
      
      const requireAsync = localRequireBuilder._createRequireAsync({
        registry,
        config,
        resolvedEntryDir: "",
        localModuleLoader: null,
        resolvedDynamicModuleLoader: dynamicModuleLoader,
        requireFn: jest.fn()
      });
      
      const result = await requireAsync("dynamic:module", "");
      
      expect(dynamicModuleLoader).toHaveBeenCalledWith(
        "dynamic:module",
        config,
        registry
      );
      expect(result).toEqual({ dynamic: true });
    });

    it("should throw error for unregistered modules", async () => {
      const registry = {};
      
      const requireAsync = localRequireBuilder._createRequireAsync({
        registry,
        config: {},
        resolvedEntryDir: "",
        localModuleLoader: null,
        resolvedDynamicModuleLoader: null,
        requireFn: jest.fn()
      });
      
      await expect(requireAsync("unregistered-module", ""))
        .rejects.toThrow("Module not registered: unregistered-module");
    });
  });

  describe("_resolveEntryDir method", () => {
    it("should return provided entryDir and dynamicModuleLoader when normal arguments", () => {
      const result = localRequireBuilder._resolveEntryDir("/path/", jest.fn(), 2);
      
      expect(result.resolvedEntryDir).toBe("/path/");
      expect(result.resolvedDynamicModuleLoader).toBeDefined();
    });

    it("should handle case when entryDir is a function and argumentCount is 3", () => {
      const mockLoadDynamicModule = jest.fn();
      
      const result = localRequireBuilder._resolveEntryDir(mockLoadDynamicModule, null, 3);
      
      expect(result.resolvedEntryDir).toBe("");
      expect(result.resolvedDynamicModuleLoader).toBe(mockLoadDynamicModule);
    });

    it("should default resolvedEntryDir to empty string when entryDir is not provided", () => {
      const result = localRequireBuilder._resolveEntryDir(null, null, 2);

      expect(result.resolvedEntryDir).toBe("");
      // The dynamic module loader will be undefined since loadDynamicModule is not set
      expect(result.resolvedDynamicModuleLoader).toBeUndefined();
    });

    it("should use loadDynamicModule as fallback when no dynamicModuleLoader provided", () => {
      const mockLoadDynamicModule = jest.fn();
      localRequireBuilder.loadDynamicModule = mockLoadDynamicModule;
      
      const result = localRequireBuilder._resolveEntryDir("/path/", null, 2);
      
      expect(result.resolvedEntryDir).toBe("/path/");
      expect(result.resolvedDynamicModuleLoader).toBe(mockLoadDynamicModule);
    });
  });

  describe("_isLocalModule method", () => {
    it("should return result of isLocalModule function when it exists", () => {
      const mockIsLocalModule = jest.fn().mockReturnValue(true);
      localRequireBuilder.isLocalModule = mockIsLocalModule;
      
      const result = localRequireBuilder._isLocalModule("./test");
      
      expect(mockIsLocalModule).toHaveBeenCalledWith("./test");
      expect(result).toBe(true);
    });

    it("should return false when isLocalModule is not a function", () => {
      localRequireBuilder.isLocalModule = null;
      
      const result = localRequireBuilder._isLocalModule("./test");
      
      expect(result).toBe(false);
    });

    it("should return false when isLocalModule is undefined", () => {
      localRequireBuilder.isLocalModule = undefined;
      
      const result = localRequireBuilder._isLocalModule("./test");
      
      expect(result).toBe(false);
    });
  });

  describe("integration tests", () => {
    it("should work through full lifecycle", () => {
      // Before initialization
      expect(localRequireBuilder.initialized).toBe(false);
      
      // Initialize
      const loadDynamicModule = jest.fn();
      const isLocalModule = jest.fn().mockReturnValue(true);
      const initResult = localRequireBuilder.initialize({ 
        loadDynamicModule, 
        isLocalModule 
      });
      
      expect(initResult).toBe(localRequireBuilder);
      expect(localRequireBuilder.initialized).toBe(true);
      expect(localRequireBuilder.loadDynamicModule).toBe(loadDynamicModule);
      expect(localRequireBuilder.isLocalModule).toBe(isLocalModule);
      
      // Verify registration happened
      expect(mockHelperRegistry.isRegistered("localRequireBuilderInstance")).toBe(true);
    });

    it("should handle complete require creation flow", async () => {
      const loadDynamicModule = jest.fn();
      const isLocalModule = jest.fn().mockImplementation((name) => name.startsWith('./'));
      localRequireBuilder.initialize({
        loadDynamicModule,
        isLocalModule
      });

      // Create a registry with a module
      const testModule = { name: "test", value: "success" };
      const registry = { "test-module": testModule };

      // Mock loaders
      const localModuleLoader = jest.fn().mockResolvedValue({ loaded: true });
      const dynamicModuleLoader = jest.fn().mockResolvedValue({ dynamic: true });

      // Create the require function
      const requireFn = localRequireBuilder.create({
        registry,
        config: { dynamicModules: [{ prefix: "dynamic:" }] },
        entryDir: "/test/",
        localModuleLoader,
        dynamicModuleLoader,
        argumentCount: 0
      });
      
      // Test sync require
      const syncResult = requireFn("test-module");
      expect(syncResult).toBe(testModule);
      
      // Test async require with existing module
      const asyncExisting = await requireFn._async("test-module");
      expect(asyncExisting).toBe(testModule);
      
      // Test async require with local module
      const asyncLocal = await requireFn._async("./local", "/test/");
      expect(localModuleLoader).toHaveBeenCalledWith(
        "./local", 
        "/test/", 
        requireFn, 
        registry
      );
      expect(asyncLocal).toEqual({ loaded: true });
      
      // Test async require with dynamic module
      const asyncDynamic = await requireFn._async("dynamic:module", "");
      expect(dynamicModuleLoader).toHaveBeenCalledWith(
        "dynamic:module",
        { dynamicModules: [{ prefix: "dynamic:" }] },
        registry
      );
      expect(asyncDynamic).toEqual({ dynamic: true });
    });
  });
});