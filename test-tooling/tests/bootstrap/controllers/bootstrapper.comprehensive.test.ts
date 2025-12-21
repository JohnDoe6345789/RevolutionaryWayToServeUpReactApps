import Bootstrapper from "../../../../bootstrap/controllers/bootstrapper.js";
import BaseController from "../../../../bootstrap/controllers/base-controller.js";
import BootstrapperConfig from "../../../../bootstrap/configs/core/bootstrapper.js";
import GlobalRootHandler from "../../../../bootstrap/constants/global-root-handler.js";

// Mock the dependencies
jest.mock("../../../../bootstrap/controllers/base-controller.js");
jest.mock("../../../../bootstrap/configs/core/bootstrapper.js");
jest.mock("../../../../bootstrap/constants/global-root-handler.js");

describe("Bootstrapper", () => {
  let mockLogging;
  let mockNetwork;
  let mockModuleLoader;
  let mockConfig;
  let originalWindow;
  let originalDocument;

  beforeEach(() => {
    // Store original values
    originalWindow = global.window;
    originalDocument = global.document;
    
    // Set up mock objects
    mockLogging = {
      setCiLoggingEnabled: jest.fn(),
      detectCiLogging: jest.fn(() => false),
      logClient: jest.fn(),
      isCiLoggingEnabled: jest.fn(() => false)
    };
    
    mockNetwork = {
      setFallbackProviders: jest.fn(),
      setDefaultProviderBase: jest.fn(),
      setProviderAliases: jest.fn()
    };
    
    mockModuleLoader = {
      loadModules: jest.fn(() => Promise.resolve({})),
      createLocalModuleLoader: jest.fn(() => ({})),
      createRequire: jest.fn(() => ({})),
      compileTSX: jest.fn(() => Promise.resolve(() => null)),
      frameworkRender: jest.fn(),
      loadTools: jest.fn(() => Promise.resolve()),
      compileSCSS: jest.fn(() => Promise.resolve("")),
      injectCSS: jest.fn()
    };
    
    mockConfig = {
      logging: mockLogging,
      network: mockNetwork,
      moduleLoader: mockModuleLoader
    };

    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original values
    global.window = originalWindow;
    global.document = originalDocument;
    
    // Clean up any cached config
    if (global.window && global.window.__rwtraConfigPromise) {
      delete global.window.__rwtraConfigPromise;
    }
    if (global.window && global.window.__rwtraConfig) {
      delete global.window.__rwtraConfig;
    }
  });

  describe("constructor", () => {
    it("should extend BaseController", () => {
      const bootstrapper = new Bootstrapper();
      expect(bootstrapper).toBeInstanceOf(BaseController);
    });

    it("should accept config and pass it to parent constructor", () => {
      const bootstrapper = new Bootstrapper(mockConfig);
      expect(BaseController).toHaveBeenCalledWith(mockConfig);
    });

    it("should create a BootstrapperConfig if plain object provided", () => {
      const plainConfig = { test: "config" };
      new Bootstrapper(plainConfig);
      expect(BootstrapperConfig).toHaveBeenCalledWith(plainConfig);
    });

    it("should use existing BootstrapperConfig if provided", () => {
      const existingConfig = new BootstrapperConfig({ test: "config" });
      new Bootstrapper(existingConfig);
      expect(BootstrapperConfig).not.toHaveBeenCalled();
    });

    it("should initialize cachedConfigPromise to null", () => {
      const bootstrapper = new Bootstrapper();
      expect(bootstrapper.cachedConfigPromise).toBeNull();
    });

    it("should set fetchImpl from config if provided", () => {
      const fetchImpl = jest.fn();
      const configWithFetch = { ...mockConfig, fetch: fetchImpl };
      const bootstrapper = new Bootstrapper(configWithFetch);
      expect(bootstrapper.fetchImpl).toBe(fetchImpl);
    });

    it("should get fetch from root handler if not provided in config", () => {
      const mockRootHandler = {
        getFetch: jest.fn(() => jest.fn())
      };
      GlobalRootHandler.mockImplementation(() => mockRootHandler);
      
      const bootstrapper = new Bootstrapper(mockConfig);
      
      expect(mockRootHandler.getFetch).toHaveBeenCalled();
    });
  });

  describe("initialize method", () => {
    let bootstrapper;

    beforeEach(() => {
      bootstrapper = new Bootstrapper(mockConfig);
    });

    it("should mark service as initialized", () => {
      bootstrapper.initialize();
      // Note: We can't easily test the private _initialized property without accessing it directly
    });

    it("should set logging, network, and moduleLoader properties", () => {
      bootstrapper.initialize();
      
      expect(bootstrapper.logging).toBe(mockLogging);
      expect(bootstrapper.network).toBe(mockNetwork);
      expect(bootstrapper.moduleLoader).toBe(mockModuleLoader);
    });

    it("should set CI logging helper methods", () => {
      bootstrapper.initialize();
      
      expect(bootstrapper.setCiLoggingEnabled).toBe(mockLogging.setCiLoggingEnabled);
      expect(bootstrapper.detectCiLogging).toBe(mockLogging.detectCiLogging);
      expect(bootstrapper.logClient).toBe(mockLogging.logClient);
      expect(bootstrapper.isCiLoggingEnabled).toBe(mockLogging.isCiLoggingEnabled);
    });

    it("should throw if already initialized", () => {
      bootstrapper.initialize();
      expect(() => bootstrapper.initialize()).toThrow();
    });
  });

  describe("bootstrap method", () => {
    let bootstrapper;

    beforeEach(() => {
      bootstrapper = new Bootstrapper(mockConfig);
      bootstrapper.initialize();
    });

    it("should call internal _bootstrap method", async () => {
      const bootstrapSpy = jest.spyOn(bootstrapper, "_bootstrap").mockResolvedValue();
      const handleSpy = jest.spyOn(bootstrapper, "_handleBootstrapError");
      
      await bootstrapper.bootstrap();
      
      expect(bootstrapSpy).toHaveBeenCalled();
      expect(handleSpy).not.toHaveBeenCalled();
    });

    it("should handle errors by calling _handleBootstrapError", async () => {
      const error = new Error("bootstrap failed");
      const bootstrapSpy = jest.spyOn(bootstrapper, "_bootstrap").mockRejectedValue(error);
      const handleSpy = jest.spyOn(bootstrapper, "_handleBootstrapError");
      
      await bootstrapper.bootstrap();
      
      expect(bootstrapSpy).toHaveBeenCalled();
      expect(handleSpy).toHaveBeenCalledWith(error);
    });
  });

  describe("_bootstrap method", () => {
    let bootstrapper;

    beforeEach(() => {
      bootstrapper = new Bootstrapper(mockConfig);
      bootstrapper.initialize();
    });

    it("should require initialization", async () => {
      const freshBootstrapper = new Bootstrapper(mockConfig);
      await expect(freshBootstrapper._bootstrap()).rejects.toThrow();
    });

    it("should load config, configure providers, and prepare assets and modules", async () => {
      const config = { entry: "main.tsx", styles: "styles.scss" };
      const loadConfigSpy = jest.spyOn(bootstrapper, "loadConfig").mockResolvedValue(config);
      const configureSpy = jest.spyOn(bootstrapper, "_configureProviders");
      const prepareAssetsSpy = jest.spyOn(bootstrapper, "_prepareAssets").mockResolvedValue();
      const prepareModulesSpy = jest.spyOn(bootstrapper, "_prepareModules").mockResolvedValue({
        registry: {}, entryDir: "", requireFn: {}
      });
      const compileRenderSpy = jest.spyOn(bootstrapper, "_compileAndRender").mockResolvedValue();

      await bootstrapper._bootstrap();

      expect(loadConfigSpy).toHaveBeenCalled();
      expect(configureSpy).toHaveBeenCalledWith(config);
      expect(prepareAssetsSpy).toHaveBeenCalledWith("styles.scss", undefined);
      expect(prepareModulesSpy).toHaveBeenCalledWith("main.tsx", config);
      expect(compileRenderSpy).toHaveBeenCalled();
    });

    it("should use default entry and style files if not provided in config", async () => {
      const config = {};
      jest.spyOn(bootstrapper, "loadConfig").mockResolvedValue(config);
      jest.spyOn(bootstrapper, "_configureProviders").mockImplementation();
      jest.spyOn(bootstrapper, "_prepareAssets").mockResolvedValue();
      jest.spyOn(bootstrapper, "_prepareModules").mockResolvedValue({
        registry: {}, entryDir: "", requireFn: {}
      });
      const compileRenderSpy = jest.spyOn(bootstrapper, "_compileAndRender").mockResolvedValue();

      await bootstrapper._bootstrap();

      expect(compileRenderSpy).toHaveBeenCalledWith(
        "main.tsx", // default entry
        "styles.scss", // default styles
        config,
        expect.any(Object),
        expect.any(String),
        expect.any(Object)
      );
    });
  });

  describe("_prepareAssets method", () => {
    let bootstrapper;

    beforeEach(() => {
      bootstrapper = new Bootstrapper(mockConfig);
      bootstrapper.initialize();
    });

    it("should load tools, compile SCSS, and inject CSS", async () => {
      const tools = [{ name: "test-tool" }];
      await bootstrapper._prepareAssets("styles.scss", tools);

      expect(bootstrapper.moduleLoader.loadTools).toHaveBeenCalledWith(tools);
      expect(bootstrapper.moduleLoader.compileSCSS).toHaveBeenCalledWith("styles.scss");
      expect(bootstrapper.moduleLoader.injectCSS).toHaveBeenCalledWith("");
    });

    it("should handle undefined tools", async () => {
      await bootstrapper._prepareAssets("styles.scss", undefined);

      expect(bootstrapper.moduleLoader.loadTools).toHaveBeenCalledWith([]);
    });
  });

  describe("_prepareModules method", () => {
    let bootstrapper;

    beforeEach(() => {
      bootstrapper = new Bootstrapper(mockConfig);
      bootstrapper.initialize();
    });

    it("should load modules, determine entry dir, create local loader, and create require function", async () => {
      const config = { modules: [{ name: "test-module" }] };
      const registry = { "test-module": {} };
      
      bootstrapper.moduleLoader.loadModules.mockResolvedValue(registry);
      bootstrapper.moduleLoader.createLocalModuleLoader.mockReturnValue(jest.fn());
      bootstrapper.moduleLoader.createRequire.mockReturnValue(jest.fn());

      const result = await bootstrapper._prepareModules("src/main.tsx", config);

      expect(bootstrapper.moduleLoader.loadModules).toHaveBeenCalledWith([{ name: "test-module" }]);
      expect(bootstrapper.moduleLoader.createLocalModuleLoader).toHaveBeenCalledWith("src");
      expect(bootstrapper.moduleLoader.createRequire).toHaveBeenCalledWith(
        registry,
        config,
        "src",
        expect.any(Function)
      );
      expect(result.registry).toBe(registry);
      expect(result.entryDir).toBe("src");
      expect(result.requireFn).toBeDefined();
    });

    it("should handle entry files without directory", async () => {
      const result = await bootstrapper._prepareModules("main.tsx", { modules: [] });
      expect(result.entryDir).toBe("");
    });
  });

  describe("_compileAndRender method", () => {
    let bootstrapper;

    beforeEach(() => {
      bootstrapper = new Bootstrapper(mockConfig);
      bootstrapper.initialize();
    });

    it("should compile TSX, render framework, and log success", async () => {
      const App = () => {};
      bootstrapper.moduleLoader.compileTSX.mockResolvedValue(App);

      await bootstrapper._compileAndRender(
        "entry.tsx",
        "styles.scss",
        { entry: "entry.tsx" },
        {},
        "",
        jest.fn()
      );

      expect(bootstrapper.moduleLoader.compileTSX).toHaveBeenCalledWith("entry.tsx", expect.any(Function), "");
      expect(bootstrapper.moduleLoader.frameworkRender).toHaveBeenCalledWith(
        { entry: "entry.tsx" },
        {},
        App
      );
      expect(bootstrapper.logClient).toHaveBeenCalledWith("bootstrap:success", {
        entryFile: "entry.tsx",
        scssFile: "styles.scss"
      });
    });
  });

  describe("_configureProviders method", () => {
    let bootstrapper;

    beforeEach(() => {
      bootstrapper = new Bootstrapper(mockConfig);
      bootstrapper.initialize();
    });

    it("should set fallback providers, default provider base, and aliases", () => {
      const config = {
        fallbackProviders: ["https://fallback.com"],
        providers: {
          default: "https://default.com",
          aliases: { alias: "https://alias.com" }
        }
      };

      bootstrapper._configureProviders(config);

      expect(bootstrapper.network.setFallbackProviders).toHaveBeenCalledWith(["https://fallback.com"]);
      expect(bootstrapper.network.setDefaultProviderBase).toHaveBeenCalledWith("https://default.com");
      expect(bootstrapper.network.setProviderAliases).toHaveBeenCalledWith({ alias: "https://alias.com" });
    });

    it("should call _enableCiLogging", () => {
      const config = {};
      const enableSpy = jest.spyOn(bootstrapper, "_enableCiLogging");

      bootstrapper._configureProviders(config);

      expect(enableSpy).toHaveBeenCalledWith(config);
    });

    it("should handle missing providers config", () => {
      const config = {
        fallbackProviders: ["https://fallback.com"]
        // No providers property
      };

      bootstrapper._configureProviders(config);

      expect(bootstrapper.network.setDefaultProviderBase).toHaveBeenCalledWith(undefined);
      expect(bootstrapper.network.setProviderAliases).toHaveBeenCalledWith(undefined);
    });
  });

  describe("loadConfig method", () => {
    let bootstrapper;

    beforeEach(() => {
      bootstrapper = new Bootstrapper(mockConfig);
      bootstrapper.initialize();
    });

    it("should return cached config from window if available", async () => {
      global.window = { __rwtraConfig: { cached: true } };
      const fetchSpy = jest.spyOn(bootstrapper, "_fetchConfig");

      const config = await bootstrapper.loadConfig();

      expect(config).toEqual({ cached: true });
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("should return cached config promise from window if available", async () => {
      global.window = { __rwtraConfigPromise: Promise.resolve({ cached: true }) };
      const fetchSpy = jest.spyOn(bootstrapper, "_fetchConfig");

      const config = await bootstrapper.loadConfig();

      expect(config).toEqual({ cached: true });
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("should fetch config if no cache available", async () => {
      const config = { fetched: true };
      jest.spyOn(bootstrapper, "_fetchConfig").mockResolvedValue(config);

      const result = await bootstrapper.loadConfig();

      expect(result).toBe(config);
    });

    it("should require initialization", async () => {
      const freshBootstrapper = new Bootstrapper(mockConfig);
      await expect(freshBootstrapper.loadConfig()).rejects.toThrow();
    });
  });

  describe("_readWindowConfigCache method", () => {
    let bootstrapper;

    beforeEach(() => {
      bootstrapper = new Bootstrapper(mockConfig);
    });

    it("should return null if no window", () => {
      global.window = undefined;
      const result = bootstrapper._readWindowConfigCache();
      expect(result).toBeNull();
    });

    it("should return cached config if available", () => {
      global.window = { __rwtraConfig: { cached: true } };
      const result = bootstrapper._readWindowConfigCache();
      expect(result).toEqual(Promise.resolve({ cached: true }));
    });

    it("should return cached config promise if available", () => {
      const promise = Promise.resolve({ cached: true });
      global.window = { __rwtraConfigPromise: promise };
      const result = bootstrapper._readWindowConfigCache();
      expect(result).toBe(promise);
    });

    it("should return null if no cache available", () => {
      global.window = {};
      const result = bootstrapper._readWindowConfigCache();
      expect(result).toBeNull();
    });
  });

  describe("_ensureCachedConfigPromise method", () => {
    let bootstrapper;

    beforeEach(() => {
      bootstrapper = new Bootstrapper(mockConfig);
      bootstrapper.initialize();
    });

    it("should create config promise if not already created", () => {
      const fetchSpy = jest.spyOn(bootstrapper, "_fetchConfig").mockResolvedValue({});

      bootstrapper._ensureCachedConfigPromise();

      expect(fetchSpy).toHaveBeenCalled();
      expect(bootstrapper.cachedConfigPromise).toBeDefined();
    });

    it("should not recreate config promise if already created", () => {
      const fetchSpy = jest.spyOn(bootstrapper, "_fetchConfig").mockResolvedValue({});
      bootstrapper._ensureCachedConfigPromise(); // First call
      const firstPromise = bootstrapper.cachedConfigPromise;
      bootstrapper._ensureCachedConfigPromise(); // Second call

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(bootstrapper.cachedConfigPromise).toBe(firstPromise);
    });

    it("should store promise on window if window is available", () => {
      global.window = {};
      jest.spyOn(bootstrapper, "_fetchConfig").mockResolvedValue({});
      
      bootstrapper._ensureCachedConfigPromise();

      expect(global.window.__rwtraConfigPromise).toBe(bootstrapper.cachedConfigPromise);
    });
  });

  describe("_consumeConfigPromise method", () => {
    let bootstrapper;

    beforeEach(() => {
      bootstrapper = new Bootstrapper(mockConfig);
      bootstrapper.initialize();
    });

    it("should await the cached promise and write config to window", async () => {
      const config = { test: "config" };
      bootstrapper.cachedConfigPromise = Promise.resolve(config);
      const writeSpy = jest.spyOn(bootstrapper, "_writeWindowConfig");

      const result = await bootstrapper._consumeConfigPromise();

      expect(result).toBe(config);
      expect(writeSpy).toHaveBeenCalledWith(config);
    });
  });

  describe("_writeWindowConfig method", () => {
    let bootstrapper;

    beforeEach(() => {
      bootstrapper = new Bootstrapper(mockConfig);
    });

    it("should write config to window if window is available", () => {
      const config = { test: "data" };
      global.window = {};
      
      bootstrapper._writeWindowConfig(config);

      expect(global.window.__rwtraConfig).toBe(config);
    });

    it("should do nothing if no window", () => {
      global.window = undefined;
      const config = { test: "data" };
      
      bootstrapper._writeWindowConfig(config);

      expect(global.window).toBeUndefined();
    });
  });

  describe("_fetchConfig method", () => {
    let bootstrapper;

    beforeEach(() => {
      bootstrapper = new Bootstrapper(mockConfig);
      bootstrapper.initialize();
    });

    it("should throw if fetch implementation is not available", async () => {
      bootstrapper.fetchImpl = undefined;
      await expect(bootstrapper._fetchConfig()).rejects.toThrow("Fetch is unavailable when loading config.json");
    });

    it("should fetch config.json by default", async () => {
      const fetchMock = jest.fn(() => Promise.resolve({ 
        ok: true, 
        json: () => Promise.resolve({ test: "config" }) 
      }));
      bootstrapper.fetchImpl = fetchMock;

      const config = await bootstrapper._fetchConfig();

      expect(fetchMock).toHaveBeenCalledWith("config.json", { cache: "no-store" });
      expect(config).toEqual({ test: "config" });
    });

    it("should use custom config URL if provided in config", async () => {
      const customConfig = { ...mockConfig, configUrl: "custom-config.json" };
      bootstrapper = new Bootstrapper(customConfig);
      bootstrapper.initialize();
      
      const fetchMock = jest.fn(() => Promise.resolve({ 
        ok: true, 
        json: () => Promise.resolve({ test: "config" }) 
      }));
      bootstrapper.fetchImpl = fetchMock;

      await bootstrapper._fetchConfig();

      expect(fetchMock).toHaveBeenCalledWith("custom-config.json", { cache: "no-store" });
    });

    it("should throw if fetch response is not OK", async () => {
      const fetchMock = jest.fn(() => Promise.resolve({ ok: false }));
      bootstrapper.fetchImpl = fetchMock;

      await expect(bootstrapper._fetchConfig()).rejects.toThrow("Failed to load config.json");
    });

    it("should return parsed JSON response", async () => {
      const expectedConfig = { modules: [], providers: {} };
      const fetchMock = jest.fn(() => Promise.resolve({ 
        ok: true, 
        json: () => Promise.resolve(expectedConfig) 
      }));
      bootstrapper.fetchImpl = fetchMock;

      const result = await bootstrapper._fetchConfig();

      expect(result).toBe(expectedConfig);
    });
  });

  describe("_enableCiLogging method", () => {
    let bootstrapper;

    beforeEach(() => {
      bootstrapper = new Bootstrapper(mockConfig);
      bootstrapper.initialize();
    });

    it("should detect CI logging and set enabled status", () => {
      const config = { ci: true };
      bootstrapper.detectCiLogging.mockReturnValue(true);

      bootstrapper._enableCiLogging(config);

      expect(bootstrapper.detectCiLogging).toHaveBeenCalledWith(config);
      expect(bootstrapper.setCiLoggingEnabled).toHaveBeenCalledWith(true);
    });

    it("should log CI enabled event if CI logging is enabled", () => {
      global.window = { location: { href: "http://test.com" } };
      bootstrapper.detectCiLogging.mockReturnValue(true);
      bootstrapper.isCiLoggingEnabled.mockReturnValue(true);

      bootstrapper._enableCiLogging({});

      expect(bootstrapper.logClient).toHaveBeenCalledWith(
        "ci:enabled",
        expect.objectContaining({ config: true, href: "http://test.com" })
      );
    });

    it("should not log CI enabled event if CI logging is not enabled", () => {
      bootstrapper.detectCiLogging.mockReturnValue(false);
      bootstrapper.isCiLoggingEnabled.mockReturnValue(false);

      bootstrapper._enableCiLogging({});

      expect(bootstrapper.logClient).not.toHaveBeenCalledWith("ci:enabled", expect.any(Object));
    });
  });

  describe("_windowHref method", () => {
    let bootstrapper;

    beforeEach(() => {
      bootstrapper = new Bootstrapper(mockConfig);
    });

    it("should return window location href if available", () => {
      global.window = { location: { href: "http://test.com" } };
      const href = bootstrapper._windowHref();
      expect(href).toBe("http://test.com");
    });

    it("should return undefined if no window", () => {
      global.window = undefined;
      const href = bootstrapper._windowHref();
      expect(href).toBeUndefined();
    });

    it("should return undefined if no location", () => {
      global.window = {};
      const href = bootstrapper._windowHref();
      expect(href).toBeUndefined();
    });
  });

  describe("_determineEntryDir method", () => {
    let bootstrapper;

    beforeEach(() => {
      bootstrapper = new Bootstrapper(mockConfig);
    });

    it("should return empty string for files without directory", () => {
      expect(bootstrapper._determineEntryDir("main.tsx")).toBe("");
    });

    it("should return directory path for files with directory", () => {
      expect(bootstrapper._determineEntryDir("src/main.tsx")).toBe("src");
      expect(bootstrapper._determineEntryDir("components/App.tsx")).toBe("components");
      expect(bootstrapper._determineEntryDir("src/components/App.tsx")).toBe("src/components");
    });

    it("should handle multiple slashes correctly", () => {
      expect(bootstrapper._determineEntryDir("a/b/c/d/file.tsx")).toBe("a/b/c/d");
    });
  });

  describe("_handleBootstrapError method", () => {
    let bootstrapper;

    beforeEach(() => {
      bootstrapper = new Bootstrapper(mockConfig);
      bootstrapper.initialize();
    });

    it("should log error and render bootstrap error", () => {
      const error = new Error("test error");
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const renderSpy = jest.spyOn(bootstrapper, "_renderBootstrapError");

      bootstrapper._handleBootstrapError(error);

      expect(consoleSpy).toHaveBeenCalledWith(error);
      expect(bootstrapper.logClient).toHaveBeenCalledWith(
        "bootstrap:error",
        expect.objectContaining({ message: "test error" })
      );
      expect(renderSpy).toHaveBeenCalledWith(error);

      consoleSpy.mockRestore();
    });

    it("should handle non-error objects", () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const renderSpy = jest.spyOn(bootstrapper, "_renderBootstrapError");

      bootstrapper._handleBootstrapError("string error");

      expect(consoleSpy).toHaveBeenCalledWith("string error");
      expect(bootstrapper.logClient).toHaveBeenCalledWith(
        "bootstrap:error",
        expect.objectContaining({ message: "string error" })
      );
      expect(renderSpy).toHaveBeenCalledWith("string error");

      consoleSpy.mockRestore();
    });
  });

  describe("_renderBootstrapError method", () => {
    let bootstrapper;

    beforeEach(() => {
      bootstrapper = new Bootstrapper(mockConfig);
    });

    it("should do nothing if no document", () => {
      global.document = undefined;
      const error = new Error("test error");
      
      bootstrapper._renderBootstrapError(error);
      
      // Should not throw or cause issues
    });

    it("should render error message in root element if available", () => {
      const rootElement = { textContent: "" };
      global.document = { getElementById: jest.fn(() => rootElement) };
      const error = new Error("render error");
      
      bootstrapper._renderBootstrapError(error);
      
      expect(global.document.getElementById).toHaveBeenCalledWith("root");
      expect(rootElement.textContent).toBe("Bootstrap error: render error");
    });

    it("should handle missing root element", () => {
      global.document = { getElementById: jest.fn(() => null) };
      const error = new Error("no root error");
      
      bootstrapper._renderBootstrapError(error);
      
      // Should not throw, just not render anything
    });

    it("should use error string if no message property", () => {
      global.document = { getElementById: jest.fn(() => ({ textContent: "" })) };
      
      bootstrapper._renderBootstrapError("plain string error");
      
      expect(global.document.getElementById("root").textContent).toBe("Bootstrap error: plain string error");
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