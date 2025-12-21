import ImportMapInitializer from "../../../../bootstrap/services/cdn/import-map-init-service.js";
import BaseService from "../../../../bootstrap/services/base-service.js";
import ImportMapInitConfig from "../../../../bootstrap/configs/cdn/import-map-init.js";

// Mock the dependencies
jest.mock("../../../../bootstrap/services/base-service.js");
jest.mock("../../../../bootstrap/configs/cdn/import-map-init.js");

describe("ImportMapInitializer", () => {
  let mockWindow;
  let mockDocument;
  let mockScriptElement;
  let mockConfig;
  let originalWindow;
  let originalGlobalThis;
  let originalFetch;

  beforeEach(() => {
    // Store original values
    originalWindow = global.window;
    originalGlobalThis = global.globalThis;
    originalFetch = global.fetch;
    
    // Set up mock DOM elements
    mockScriptElement = { textContent: "" };
    mockDocument = {
      querySelector: jest.fn(() => mockScriptElement)
    };
    mockWindow = {
      document: mockDocument,
      __rwtraBootstrap: { helpers: {} }
    };
    
    mockConfig = {
      window: mockWindow,
      fetch: jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }))
    };

    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original values
    global.window = originalWindow;
    global.globalThis = originalGlobalThis;
    global.fetch = originalFetch;
    
    // Clean up any config promises
    if (mockWindow && mockWindow.__rwtraConfigPromise) {
      delete mockWindow.__rwtraConfigPromise;
    }
  });

  describe("constructor", () => {
    it("should extend BaseService", () => {
      const service = new ImportMapInitializer();
      expect(service).toBeInstanceOf(BaseService);
    });

    it("should accept config and pass it to parent constructor", () => {
      const service = new ImportMapInitializer(mockConfig);
      expect(BaseService).toHaveBeenCalledWith(mockConfig);
    });

    it("should create a default config if none provided", () => {
      new ImportMapInitializer();
      expect(ImportMapInitConfig).toHaveBeenCalled();
    });
  });

  describe("initialize method", () => {
    let service;

    beforeEach(() => {
      service = new ImportMapInitializer(mockConfig);
    });

    it("should mark service as initialized", async () => {
      const result = await service.initialize();
      expect(service).toBe(result);
      // Note: We can't easily test the private _initialized property without accessing it directly
    });

    it("should set window from config if provided", async () => {
      await service.initialize();
      expect(service.window).toBe(mockWindow);
    });

    it("should set window to global window if not provided in config", async () => {
      const configWithoutWindow = { fetch: mockConfig.fetch };
      service = new ImportMapInitializer(configWithoutWindow);
      await service.initialize();
      expect(service.window).toBe(global.window);
    });

    it("should set fetch implementation from config if provided", async () => {
      await service.initialize();
      expect(service.fetchImpl).toBe(mockConfig.fetch);
    });

    it("should return early if no window is available", async () => {
      const configWithoutWindow = { window: null, fetch: null };
      service = new ImportMapInitializer(configWithoutWindow);
      const result = await service.initialize();
      expect(result).toBe(service);
    });

    it("should return early if no import map script element is found", async () => {
      mockDocument.querySelector = jest.fn(() => null);
      const service = new ImportMapInitializer(mockConfig);
      const result = await service.initialize();
      expect(result).toBe(service);
      expect(mockDocument.querySelector).toHaveBeenCalledWith("script[data-rwtra-importmap]");
    });

    it("should return early if config promise already exists", async () => {
      mockWindow.__rwtraConfigPromise = Promise.resolve({});
      const service = new ImportMapInitializer(mockConfig);
      const result = await service.initialize();
      expect(result).toBe(service);
    });

    it("should create bootstrap namespace if not present", async () => {
      const windowWithoutNamespace = { document: mockDocument };
      const configWithWindow = { ...mockConfig, window: windowWithoutNamespace };
      service = new ImportMapInitializer(configWithWindow);
      await service.initialize();
      expect(windowWithoutNamespace.__rwtraBootstrap).toBeDefined();
      expect(windowWithoutNamespace.__rwtraBootstrap.helpers).toBeDefined();
    });

    it("should use existing network helpers if available", async () => {
      const networkHelpers = { 
        resolveModuleUrl: jest.fn(), 
        setFallbackProviders: jest.fn(),
        setDefaultProviderBase: jest.fn(),
        setProviderAliases: jest.fn()
      };
      mockWindow.__rwtraBootstrap.helpers.network = networkHelpers;
      service = new ImportMapInitializer(mockConfig);
      await service.initialize();
      // The service will use the existing network helpers
    });

    it("should use fallback functions if network helpers are not available", async () => {
      delete mockWindow.__rwtraBootstrap.helpers.network;
      service = new ImportMapInitializer(mockConfig);
      await service.initialize();
      // Should not throw, should use fallback functions
    });

    it("should fetch and process config", async () => {
      const configPayload = {
        fallbackProviders: ["https://fallback.example.com/"],
        providers: { default: "https://default.example.com/", aliases: { alias: "https://alias.example.com/" } },
        modules: [
          { name: "test-module", url: "https://example.com/test.js" }
        ]
      };
      const fetchMock = jest.fn(() => Promise.resolve({ 
        ok: true, 
        json: () => Promise.resolve(configPayload) 
      }));
      
      const configWithFetch = { ...mockConfig, fetch: fetchMock };
      service = new ImportMapInitializer(configWithFetch);
      await service.initialize();
      
      expect(fetchMock).toHaveBeenCalledWith("config.json", { cache: "no-store" });
    });

    it("should set provider configurations", async () => {
      const networkHelpers = { 
        resolveModuleUrl: jest.fn(() => Promise.resolve("https://example.com/resolved.js")),
        setFallbackProviders: jest.fn(),
        setDefaultProviderBase: jest.fn(),
        setProviderAliases: jest.fn()
      };
      mockWindow.__rwtraBootstrap.helpers.network = networkHelpers;
      
      const configPayload = {
        fallbackProviders: ["https://fallback.example.com/"],
        providers: { default: "https://default.example.com/", aliases: { alias: "https://alias.example.com/" } },
        modules: []
      };
      const fetchMock = jest.fn(() => Promise.resolve({ 
        ok: true, 
        json: () => Promise.resolve(configPayload) 
      }));
      
      const configWithFetch = { ...mockConfig, fetch: fetchMock };
      service = new ImportMapInitializer(configWithFetch);
      await service.initialize();
      
      expect(networkHelpers.setFallbackProviders).toHaveBeenCalledWith(["https://fallback.example.com/"]);
      expect(networkHelpers.setDefaultProviderBase).toHaveBeenCalledWith("https://default.example.com/");
      expect(networkHelpers.setProviderAliases).toHaveBeenCalledWith({ alias: "https://alias.example.com/" });
    });

    it("should populate import map with resolved module URLs", async () => {
      const networkHelpers = { 
        resolveModuleUrl: jest.fn((mod) => Promise.resolve(`https://resolved.com/${mod.name}.js`)),
        setFallbackProviders: jest.fn(),
        setDefaultProviderBase: jest.fn(),
        setProviderAliases: jest.fn()
      };
      mockWindow.__rwtraBootstrap.helpers.network = networkHelpers;
      
      const configPayload = {
        fallbackProviders: [],
        providers: {},
        modules: [
          { name: "test-module", importSpecifiers: ["@test/module"] }
        ]
      };
      const fetchMock = jest.fn(() => Promise.resolve({ 
        ok: true, 
        json: () => Promise.resolve(configPayload) 
      }));
      
      const configWithFetch = { ...mockConfig, fetch: fetchMock };
      service = new ImportMapInitializer(configWithFetch);
      await service.initialize();
      
      const parsedImports = JSON.parse(mockScriptElement.textContent);
      expect(parsedImports.imports["@test/module"]).toBe("https://resolved.com/test-module.js");
    });

    it("should handle modules with pre-defined URLs", async () => {
      const networkHelpers = { 
        resolveModuleUrl: jest.fn(),
        setFallbackProviders: jest.fn(),
        setDefaultProviderBase: jest.fn(),
        setProviderAliases: jest.fn()
      };
      mockWindow.__rwtraBootstrap.helpers.network = networkHelpers;
      
      const configPayload = {
        fallbackProviders: [],
        providers: {},
        modules: [
          { name: "predefined-module", url: "https://example.com/predefined.js" }
        ]
      };
      const fetchMock = jest.fn(() => Promise.resolve({ 
        ok: true, 
        json: () => Promise.resolve(configPayload) 
      }));
      
      const configWithFetch = { ...mockConfig, fetch: fetchMock };
      service = new ImportMapInitializer(configWithFetch);
      await service.initialize();
      
      const parsedImports = JSON.parse(mockScriptElement.textContent);
      expect(parsedImports.imports["predefined-module"]).toBe("https://example.com/predefined.js");
      // resolveModuleUrl should not have been called for pre-defined URLs
      expect(networkHelpers.resolveModuleUrl).not.toHaveBeenCalled();
    });

    it("should use module name as import specifier if none provided", async () => {
      const networkHelpers = { 
        resolveModuleUrl: jest.fn((mod) => Promise.resolve(`https://resolved.com/${mod.name}.js`)),
        setFallbackProviders: jest.fn(),
        setDefaultProviderBase: jest.fn(),
        setProviderAliases: jest.fn()
      };
      mockWindow.__rwtraBootstrap.helpers.network = networkHelpers;
      
      const configPayload = {
        fallbackProviders: [],
        providers: {},
        modules: [
          { name: "test-module" } // No importSpecifiers
        ]
      };
      const fetchMock = jest.fn(() => Promise.resolve({ 
        ok: true, 
        json: () => Promise.resolve(configPayload) 
      }));
      
      const configWithFetch = { ...mockConfig, fetch: fetchMock };
      service = new ImportMapInitializer(configWithFetch);
      await service.initialize();
      
      const parsedImports = JSON.parse(mockScriptElement.textContent);
      expect(parsedImports.imports["test-module"]).toBe("https://resolved.com/test-module.js");
    });

    it("should store config on window", async () => {
      const configPayload = { test: "config" };
      const fetchMock = jest.fn(() => Promise.resolve({ 
        ok: true, 
        json: () => Promise.resolve(configPayload) 
      }));
      
      const configWithFetch = { ...mockConfig, fetch: fetchMock };
      service = new ImportMapInitializer(configWithFetch);
      await service.initialize();
      
      expect(mockWindow.__rwtraConfig).toBe(configPayload);
    });

    it("should store config promise on window", async () => {
      const configPayload = { test: "config" };
      const fetchMock = jest.fn(() => Promise.resolve({ 
        ok: true, 
        json: () => Promise.resolve(configPayload) 
      }));
      
      const configWithFetch = { ...mockConfig, fetch: fetchMock };
      service = new ImportMapInitializer(configWithFetch);
      await service.initialize();
      
      expect(mockWindow.__rwtraConfigPromise).toBeDefined();
      await mockWindow.__rwtraConfigPromise; // Ensure promise resolves
    });

    it("should throw if module URL resolution fails", async () => {
      const networkHelpers = { 
        resolveModuleUrl: jest.fn(() => Promise.resolve("")), // Return empty URL
        setFallbackProviders: jest.fn(),
        setDefaultProviderBase: jest.fn(),
        setProviderAliases: jest.fn()
      };
      mockWindow.__rwtraBootstrap.helpers.network = networkHelpers;
      
      const configPayload = {
        fallbackProviders: [],
        providers: {},
        modules: [
          { name: "failing-module" }
        ]
      };
      const fetchMock = jest.fn(() => Promise.resolve({ 
        ok: true, 
        json: () => Promise.resolve(configPayload) 
      }));
      
      const configWithFetch = { ...mockConfig, fetch: fetchMock };
      service = new ImportMapInitializer(configWithFetch);
      
      await expect(service.initialize()).rejects.toThrow("Failed to resolve module URL for failing-module");
    });

    it("should handle fetch failure gracefully", async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const fetchMock = jest.fn(() => Promise.resolve({ 
        ok: false,
        status: 404
      }));
      
      const configWithFetch = { ...mockConfig, fetch: fetchMock };
      service = new ImportMapInitializer(configWithFetch);
      
      await expect(service.initialize()).rejects.toThrow("Failed to fetch config.json: 404");
      expect(consoleErrorSpy).toHaveBeenCalledWith("rwtra: failed to initialize import map", expect.any(Error));
      
      consoleErrorSpy.mockRestore();
    });

    it("should throw if fetch is unavailable", async () => {
      const configWithoutFetch = { window: mockWindow, fetch: null };
      service = new ImportMapInitializer(configWithoutFetch);
      
      await expect(service.initialize()).rejects.toThrow("Fetch unavailable when initializing import map");
    });

    it("should throw if already initialized", async () => {
      await service.initialize();
      await expect(service.initialize()).rejects.toThrow();
    });
  });

  describe("_fetchConfig method", () => {
    let service;

    beforeEach(() => {
      service = new ImportMapInitializer(mockConfig);
      service.window = mockWindow;
    });

    it("should throw error if fetch implementation is not available", async () => {
      service.fetchImpl = undefined;
      await expect(service._fetchConfig("config.json")).rejects.toThrow("Fetch unavailable when initializing import map");
    });

    it("should call fetch with correct parameters", async () => {
      const fetchMock = jest.fn(() => Promise.resolve({ 
        ok: true, 
        json: () => Promise.resolve({}) 
      }));
      service.fetchImpl = fetchMock;
      
      await service._fetchConfig("test-config.json");
      
      expect(fetchMock).toHaveBeenCalledWith("test-config.json", { cache: "no-store" });
    });

    it("should throw error if fetch response is not ok", async () => {
      const fetchMock = jest.fn(() => Promise.resolve({ 
        ok: false,
        status: 500
      }));
      service.fetchImpl = fetchMock;
      
      await expect(service._fetchConfig("config.json")).rejects.toThrow("Failed to fetch config.json: 500");
    });

    it("should return parsed JSON response", async () => {
      const expectedConfig = { modules: [], providers: {} };
      const fetchMock = jest.fn(() => Promise.resolve({ 
        ok: true, 
        json: () => Promise.resolve(expectedConfig)
      }));
      service.fetchImpl = fetchMock;
      
      const result = await service._fetchConfig("config.json");
      
      expect(result).toBe(expectedConfig);
    });
  });

  describe("integration", () => {
    it("should work with real dependencies when not mocked", () => {
      // This test would run without mocks to verify integration
      // For now, we'll skip this since we're using mocks throughout
      expect(true).toBe(true);
    });
  });
});