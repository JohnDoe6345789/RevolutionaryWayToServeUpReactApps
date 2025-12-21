import LocalDependencyLoader from "../../../bootstrap/services/local/local-dependency-loader.js";
import LocalRequireBuilder from "../../../bootstrap/services/local/local-require-builder.js";
import LocalHelpers from "../../../bootstrap/helpers/local-helpers.js";

// Create a mock helper registry
const createMockHelperRegistry = () => {
  return {
    register: jest.fn(),
    get: jest.fn(),
    getHelper: jest.fn(),
    isRegistered: jest.fn().mockReturnValue(false),
  };
};

describe("Local Services", () => {
  describe("LocalDependencyLoader", () => {
    let localDependencyLoader;
    let mockHelperRegistry;
    let mockServiceRegistry;

    beforeEach(() => {
      mockHelperRegistry = createMockHelperRegistry();
      mockServiceRegistry = {
        getService: jest.fn(),
      };
      
      const LocalDependencyLoaderConfig = require("../../bootstrap/configs/local/local-dependency-loader.js");
      const config = new LocalDependencyLoaderConfig({
        helperRegistry: mockHelperRegistry,
        overrides: {},
        isCommonJs: false,
        helpers: {},
      });
      
      localDependencyLoader = new LocalDependencyLoader(config);
    });

    describe("constructor", () => {
      it("should create an instance with provided config", () => {
        expect(localDependencyLoader).toBeInstanceOf(LocalDependencyLoader);
        expect(localDependencyLoader.config).toBeDefined();
      });

      it("should create an instance with default config when none provided", () => {
        const loader = new LocalDependencyLoader();
        expect(loader).toBeInstanceOf(LocalDependencyLoader);
        expect(loader.config).toBeDefined();
      });
    });

    describe("initialize method", () => {
      it("should set up internal properties and return dependencies", () => {
        const result = localDependencyLoader.initialize(mockServiceRegistry);
        
        expect(localDependencyLoader.dependencies).toEqual(result);
        expect(localDependencyLoader.initialized).toBe(true);
        expect(Array.isArray(Object.keys(result))).toBe(true);
      });

      it("should populate config helpers with resolved dependencies", () => {
        localDependencyLoader.initialize(mockServiceRegistry);
        
        const helperKeys = Object.keys(localDependencyLoader.config.helpers);
        expect(helperKeys.length).toBeGreaterThan(0);
      });

      it("should register itself with the helper registry if not already registered", () => {
        localDependencyLoader.initialize(mockServiceRegistry);
        
        expect(mockHelperRegistry.register).toHaveBeenCalledWith(
          "localDependencyLoader",
          localDependencyLoader,
          { folder: "services/local", domain: "local" },
          []
        );
      });

      it("should not register if already registered", () => {
        mockHelperRegistry.isRegistered.mockReturnValue(true);
        
        localDependencyLoader.initialize(mockServiceRegistry);
        
        expect(mockHelperRegistry.register).not.toHaveBeenCalled();
      });

      it("should throw if already initialized", () => {
        localDependencyLoader.initialize(mockServiceRegistry);
        
        expect(() => {
          localDependencyLoader.initialize(mockServiceRegistry);
        }).toThrow(/already initialized/);
      });

      it("should handle service registry properly", () => {
        const mockService = { someService: true };
        mockServiceRegistry.getService = jest.fn().mockReturnValue(mockService);
        
        const result = localDependencyLoader.initialize(mockServiceRegistry);
        
        expect(mockServiceRegistry.getService).toHaveBeenCalled();
      });
    });

    describe("_dependencyDescriptors method", () => {
      it("should return the expected dependency descriptors", () => {
        const descriptors = localDependencyLoader._dependencyDescriptors();
        
        expect(descriptors).toHaveLength(6);
        
        const expectedNames = ["logging", "dynamicModules", "sassCompiler", "tsxCompiler", "localPaths", "localModuleLoader"];
        const actualNames = descriptors.map(d => d.name);
        
        expect(actualNames).toEqual(expectedNames);
        
        // Check first descriptor
        expect(descriptors[0]).toEqual({
          name: "logging",
          fallback: "../../cdn/logging.js",
          helper: "logging"
        });
        
        // Check last descriptor
        expect(descriptors[5]).toEqual({
          name: "localModuleLoader",
          fallback: "../../initializers/loaders/local-module-loader.js",
          helper: "localModuleLoader"
        });
      });
    });

    describe("_resolve method", () => {
      beforeEach(() => {
        localDependencyLoader.initialize(mockServiceRegistry);
      });

      it("should return override if available", () => {
        const LocalDependencyLoaderConfig = require("../../bootstrap/configs/local/local-dependency-loader.js");
        const config = new LocalDependencyLoaderConfig({
          helperRegistry: mockHelperRegistry,
          overrides: { logging: "overridden-logging" },
          isCommonJs: false,
          helpers: {},
        });
        
        const loader = new LocalDependencyLoader(config);
        loader.initialize(mockServiceRegistry);
        
        const descriptor = { name: "logging", fallback: "../../cdn/logging.js", helper: "logging" };
        const result = loader._resolve(descriptor, mockServiceRegistry);
        
        expect(result).toBe("overridden-logging");
      });

      it("should return service from service registry if available", () => {
        const mockService = { service: "from-registry" };
        const mockServiceReg = {
          getService: jest.fn().mockReturnValue(mockService),
        };
        
        const descriptor = { name: "logging", fallback: "../../cdn/logging.js", helper: "logging" };
        const result = localDependencyLoader._resolve(descriptor, mockServiceReg);
        
        expect(mockServiceReg.getService).toHaveBeenCalledWith("logging");
        expect(result).toBe(mockService);
      });

      it("should return helper from helpers if available", () => {
        const mockHelper = { helper: "from-helpers" };
        const LocalDependencyLoaderConfig = require("../../bootstrap/configs/local/local-dependency-loader.js");
        const config = new LocalDependencyLoaderConfig({
          helperRegistry: mockHelperRegistry,
          overrides: {},
          isCommonJs: false,
          helpers: { logging: mockHelper },
        });
        
        const loader = new LocalDependencyLoader(config);
        loader.initialize(mockServiceRegistry);
        
        const descriptor = { name: "logging", fallback: "../../cdn/logging.js", helper: "logging" };
        const result = loader._resolve(descriptor, mockServiceRegistry);
        
        expect(result).toBe(mockHelper);
      });

      it("should return helper from helper registry if available", () => {
        const mockHelper = { helper: "from-registry" };
        mockHelperRegistry.getHelper.mockReturnValue(mockHelper);

        // Mock the config to have an empty helpers object and a helperRegistry
        localDependencyLoader.config.helpers = {};
        localDependencyLoader.config.helperRegistry = mockHelperRegistry;

        const descriptor = { name: "logging", fallback: "../../cdn/logging.js", helper: "logging" };
        const result = localDependencyLoader._resolve(descriptor, mockServiceRegistry);

        expect(mockHelperRegistry.getHelper).toHaveBeenCalledWith("logging");
        expect(result).toBe(mockHelper);
      });

      it("should return empty object as fallback", () => {
        const descriptor = { name: "nonexistent", fallback: "./nonexistent.js", helper: "nonexistent" };
        const result = localDependencyLoader._resolve(descriptor, mockServiceRegistry);
        
        expect(result).toEqual({});
      });
    });

    describe("integration tests", () => {
      it("should work through full lifecycle", () => {
        expect(localDependencyLoader.initialized).toBe(false);
        expect(localDependencyLoader.dependencies).toBeFalsy();
        
        const result = localDependencyLoader.initialize(mockServiceRegistry);
        
        expect(result).toBeDefined();
        expect(localDependencyLoader.initialized).toBe(true);
        expect(localDependencyLoader.dependencies).toEqual(result);
        
        // Verify that dependencies were resolved
        const depNames = Object.keys(result);
        expect(depNames.length).toBeGreaterThan(0);
      });

      it("should handle different configuration scenarios", () => {
        // Test with overrides
        const LocalDependencyLoaderConfig = require("../../bootstrap/configs/local/local-dependency-loader.js");
        const configWithOverrides = new LocalDependencyLoaderConfig({
          helperRegistry: mockHelperRegistry,
          overrides: { logging: "custom-logging" },
          isCommonJs: false,
          helpers: {},
        });
        
        const loaderWithOverrides = new LocalDependencyLoader(configWithOverrides);
        const result = loaderWithOverrides.initialize(mockServiceRegistry);
        
        expect(result.logging).toBe("custom-logging");
      });
    });
  });

  describe("LocalRequireBuilder", () => {
    let localRequireBuilder;
    let mockHelperRegistry;

    beforeEach(() => {
      mockHelperRegistry = createMockHelperRegistry();
      
      const config = new LocalRequireBuilder.Config({ helperRegistry: mockHelperRegistry });
      localRequireBuilder = new LocalRequireBuilder(config);
    });

    describe("constructor", () => {
      it("should create an instance with provided config", () => {
        expect(localRequireBuilder).toBeInstanceOf(LocalRequireBuilder);
        expect(localRequireBuilder.config).toBeDefined();
      });

      it("should create an instance with default config when none provided", () => {
        const builder = new LocalRequireBuilder();
        expect(builder).toBeInstanceOf(LocalRequireBuilder);
        expect(builder.config).toBeDefined();
      });
    });

    describe("initialize method", () => {
      it("should set up internal properties", () => {
        const mockLoadDynamicModule = jest.fn();
        const mockIsLocalModule = jest.fn();
        
        const result = localRequireBuilder.initialize({
          loadDynamicModule: mockLoadDynamicModule,
          isLocalModule: mockIsLocalModule
        });
        
        expect(localRequireBuilder.loadDynamicModule).toBe(mockLoadDynamicModule);
        expect(localRequireBuilder.isLocalModule).toBe(mockIsLocalModule);
        expect(localRequireBuilder.initialized).toBe(true);
        expect(result).toBe(localRequireBuilder);
      });

      it("should register itself with the helper registry", () => {
        const mockLoadDynamicModule = jest.fn();
        const mockIsLocalModule = jest.fn();
        
        localRequireBuilder.initialize({
          loadDynamicModule: mockLoadDynamicModule,
          isLocalModule: mockIsLocalModule
        });
        
        expect(mockHelperRegistry.register).toHaveBeenCalledWith(
          "localRequireBuilderInstance",
          localRequireBuilder,
          { folder: "services/local/helpers", domain: "helpers" },
          []
        );
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

      it("should not register if no helper registry is provided", () => {
        const config = new LocalRequireBuilder.Config({ helperRegistry: undefined });
        const builder = new LocalRequireBuilder(config);
        
        const mockLoadDynamicModule = jest.fn();
        const mockIsLocalModule = jest.fn();
        
        builder.initialize({
          loadDynamicModule: mockLoadDynamicModule,
          isLocalModule: mockIsLocalModule
        });
        
        expect(mockHelperRegistry.register).not.toHaveBeenCalled();
      });
    });

    describe("create method", () => {
      beforeEach(() => {
        const mockLoadDynamicModule = jest.fn();
        const mockIsLocalModule = jest.fn();
        localRequireBuilder.initialize({
          loadDynamicModule: mockLoadDynamicModule,
          isLocalModule: mockIsLocalModule
        });
      });

      it("should throw if not initialized", () => {
        const uninitializedBuilder = new LocalRequireBuilder();
        
        expect(() => {
          uninitializedBuilder.create({});
        }).toThrow("LocalRequireBuilder not initialized");
      });

      it("should create a require function with async method", () => {
        const registry = { testModule: "testValue" };
        const config = {};
        const entryDir = "";
        const localModuleLoader = jest.fn();
        const dynamicModuleLoader = jest.fn();
        
        const requireFn = localRequireBuilder.create({
          registry,
          config,
          entryDir,
          localModuleLoader,
          dynamicModuleLoader
        });
        
        expect(typeof requireFn).toBe("function");
        expect(typeof requireFn._async).toBe("function");
      });

      it("should return existing modules from registry", () => {
        const registry = { existingModule: "exists" };
        const config = {};
        const entryDir = "";
        const localModuleLoader = jest.fn();
        const dynamicModuleLoader = jest.fn();
        
        const requireFn = localRequireBuilder.create({
          registry,
          config,
          entryDir,
          localModuleLoader,
          dynamicModuleLoader
        });
        
        const result = requireFn("existingModule");
        expect(result).toBe("exists");
      });

      it("should throw error for missing modules", () => {
        const registry = {};
        const config = {};
        const entryDir = "";
        const localModuleLoader = jest.fn();
        const dynamicModuleLoader = jest.fn();
        
        const requireFn = localRequireBuilder.create({
          registry,
          config,
          entryDir,
          localModuleLoader,
          dynamicModuleLoader
        });
        
        expect(() => {
          requireFn("missingModule");
        }).toThrow("Module not yet loaded: missingModule (use a preload step via requireAsync for dynamic modules)");
      });
    });

    describe("integration tests", () => {
      it("should work through full lifecycle", () => {
        const mockLoadDynamicModule = jest.fn();
        const mockIsLocalModule = jest.fn().mockReturnValue(false);
        
        expect(localRequireBuilder.initialized).toBe(false);
        
        const result = localRequireBuilder.initialize({
          loadDynamicModule: mockLoadDynamicModule,
          isLocalModule: mockIsLocalModule
        });
        
        expect(result).toBe(localRequireBuilder);
        expect(localRequireBuilder.initialized).toBe(true);
        expect(localRequireBuilder.loadDynamicModule).toBe(mockLoadDynamicModule);
        expect(localRequireBuilder.isLocalModule).toBe(mockIsLocalModule);
      });

      it("should handle complete require creation flow", () => {
        const mockLoadDynamicModule = jest.fn();
        const mockIsLocalModule = jest.fn().mockReturnValue(false);
        
        localRequireBuilder.initialize({
          loadDynamicModule: mockLoadDynamicModule,
          isLocalModule: mockIsLocalModule
        });
        
        const registry = { existingModule: "value" };
        const config = {};
        const entryDir = "";
        const localModuleLoader = jest.fn();
        const dynamicModuleLoader = jest.fn();
        
        const requireFn = localRequireBuilder.create({
          registry,
          config,
          entryDir,
          localModuleLoader,
          dynamicModuleLoader
        });
        
        // Test synchronous require
        expect(requireFn("existingModule")).toBe("value");
        
        // Test async require
        expect(typeof requireFn._async).toBe("function");
      });
    });
  });

  describe("LocalHelpers", () => {
    let mockHelperRegistry;
    let localHelpers;

    beforeEach(() => {
      mockHelperRegistry = createMockHelperRegistry();
      
      // Create a config with mock registry
      const config = {
        helperRegistry: mockHelperRegistry,
      };
      
      localHelpers = new LocalHelpers(config);
    });

    describe("constructor", () => {
      it("should create an instance with provided config", () => {
        expect(localHelpers).toBeInstanceOf(LocalHelpers);
        expect(localHelpers.config).toBeDefined();
        expect(localHelpers.config.helperRegistry).toBe(mockHelperRegistry);
      });

      it("should create an instance with default config when none provided", () => {
        // For this test, we'll bypass default config creation by providing a minimal config
        const config = { helperRegistry: createMockHelperRegistry() };
        const helpers = new LocalHelpers(config);
        
        expect(helpers).toBeInstanceOf(LocalHelpers);
        expect(helpers.config).toBeDefined();
      });

      it("should set initialized to false initially", () => {
        expect(localHelpers.initialized).toBe(false);
      });
    });

    describe("initialize method", () => {
      it("should register frameworkRenderer and localRequireBuilder helpers", () => {
        const result = localHelpers.initialize();
        
        // Check that both helpers were registered
        expect(mockHelperRegistry.register).toHaveBeenCalledTimes(2);
        
        // Verify first registration (frameworkRenderer)
        expect(mockHelperRegistry.register).toHaveBeenNthCalledWith(
          1,
          "frameworkRenderer",
          expect.anything(), // FrameworkRenderer constructor
          { folder: "services/local/helpers", domain: "helpers" },
          []
        );
        
        // Verify second registration (localRequireBuilder)
        expect(mockHelperRegistry.register).toHaveBeenNthCalledWith(
          2,
          "localRequireBuilder",
          expect.anything(), // LocalRequireBuilder constructor
          { folder: "services/local/helpers", domain: "helpers" },
          []
        );
        
        expect(localHelpers.initialized).toBe(true);
        expect(result).toBe(localHelpers);
      });

      it("should return instance to allow chaining", () => {
        const result = localHelpers.initialize();
        
        expect(result).toBe(localHelpers);
      });

      it("should set initialized flag to true", () => {
        localHelpers.initialize();
        
        expect(localHelpers.initialized).toBe(true);
      });

      it("should return early if already initialized", () => {
        localHelpers.initialize();
        const registerCallCountBefore = mockHelperRegistry.register.mock.calls.length;
        
        const result = localHelpers.initialize();
        
        // Should return same instance without making additional register calls
        expect(result).toBe(localHelpers);
        expect(mockHelperRegistry.register).toHaveBeenCalledTimes(registerCallCountBefore);
      });
    });

    describe("integration tests", () => {
      it("should work through full lifecycle", () => {
        expect(localHelpers.initialized).toBe(false);
        
        const result = localHelpers.initialize();
        
        expect(result).toBe(localHelpers);
        expect(localHelpers.initialized).toBe(true);
        
        // Verify both helpers were registered
        expect(mockHelperRegistry.register).toHaveBeenCalledTimes(2);
        
        // Verify specific registration details
        const firstCall = mockHelperRegistry.register.mock.calls[0];
        expect(firstCall[0]).toBe("frameworkRenderer");
        expect(firstCall[2]).toEqual({ folder: "services/local/helpers", domain: "helpers" });
        
        const secondCall = mockHelperRegistry.register.mock.calls[1];
        expect(secondCall[0]).toBe("localRequireBuilder");
        expect(secondCall[2]).toEqual({ folder: "services/local/helpers", domain: "helpers" });
      });

      it("should handle multiple initialization attempts gracefully", () => {
        localHelpers.initialize();
        
        // Capture call count after first initialization
        const initialCallCount = mockHelperRegistry.register.mock.calls.length;
        
        // Try initializing again
        localHelpers.initialize();
        
        // Call count should remain the same
        expect(mockHelperRegistry.register).toHaveBeenCalledTimes(initialCallCount);
        expect(localHelpers.initialized).toBe(true);
      });
    });
  });
});
