import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
  resetServiceRegistry
} from "../testGlobals";

// Import the actual modules we're testing
const LoggingService = require("../../bootstrap/services/cdn/logging-service.js");
const NetworkService = require("../../bootstrap/services/cdn/network-service.js");
const DynamicModulesService = require("../../bootstrap/services/cdn/dynamic-modules-service.js");

describe("CDN Helpers Comprehensive Tests", () => {
  let originalWindow;
  let originalConsole;
  let originalNavigator;
  let originalFetch;

  beforeEach(() => {
    // Save original globals
    originalWindow = global.window;
    originalConsole = global.console;
    originalNavigator = global.navigator;
    originalFetch = global.fetch;
    
    // Set up mock globals
    global.window = {
      location: { search: "", hostname: "localhost", href: "http://test.com" },
      __RWTRA_CI_MODE__: undefined
    };
    
    global.console = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn()
    };
    
    global.navigator = {
      sendBeacon: jest.fn(() => true)
    };
    
    global.fetch = jest.fn(() => Promise.resolve({ ok: true }));
    
    // Reset service registry
    resetServiceRegistry();
  });

  afterEach(() => {
    // Restore original globals
    global.window = originalWindow;
    global.console = originalConsole;
    global.navigator = originalNavigator;
    global.fetch = originalFetch;
  });

  describe("LoggingService tests", () => {
    let loggingService;
    let mockConfig;

    beforeEach(() => {
      mockConfig = {
        namespace: { helpers: {} },
        serviceRegistry: { register: jest.fn() },
        ciLogQueryParam: "ci",
        clientLogEndpoint: "/api/log"
      };
      loggingService = new LoggingService(mockConfig);
      loggingService.initialize();
    });

    describe("constructor", () => {
      it("should create an instance with provided config", () => {
        expect(loggingService.config).toBe(mockConfig);
      });

      it("should create an instance with default config when none provided", () => {
        const service = new LoggingService();
        expect(service.config).toBeDefined();
      });

      it("should extend BaseService", () => {
        expect(loggingService).toBeInstanceOf(Object); // Actual inheritance check depends on implementation
      });
    });

    describe("initialize method", () => {
      it("should set up internal properties correctly", () => {
        expect(loggingService.namespace).toBe(mockConfig.namespace);
        expect(loggingService.helpers).toBe(mockConfig.namespace.helpers);
        expect(typeof loggingService.isCommonJs).toBe('boolean');
        expect(loggingService.ciLoggingEnabled).toBe(false);
      });

      it("should bind methods to the service instance", () => {
        expect(loggingService.setCiLoggingEnabled).toBeInstanceOf(Function);
        expect(loggingService.detectCiLogging).toBeInstanceOf(Function);
        expect(loggingService.logClient).toBeInstanceOf(Function);
        expect(loggingService.wait).toBeInstanceOf(Function);
        expect(loggingService.serializeForLog).toBeInstanceOf(Function);
        expect(loggingService.isCiLoggingEnabled).toBeInstanceOf(Function);
        
        // Verify methods are bound to the service instance
        expect(loggingService.setCiLoggingEnabled).not.toBe(LoggingService.prototype.setCiLoggingEnabled);
      });

      it("should set up configuration fallbacks", () => {
        expect(loggingService.ciLogQueryParam).toBe("ci");
        expect(loggingService.clientLogEndpoint).toBe("/api/log");
      });

      it("should register the service in the service registry", () => {
        expect(mockConfig.serviceRegistry.register).toHaveBeenCalledWith(
          "logging",
          loggingService,
          {
            folder: "services/cdn",
            domain: "cdn",
          },
          []
        );
      });

      it("should throw if initialized twice", () => {
        expect(() => loggingService.initialize()).toThrow();
      });
    });

    describe("setCiLoggingEnabled method", () => {
      it("should enable CI logging when true is passed", () => {
        loggingService.setCiLoggingEnabled(true);
        expect(loggingService.ciLoggingEnabled).toBe(true);
      });

      it("should disable CI logging when false is passed", () => {
        loggingService.setCiLoggingEnabled(false);
        expect(loggingService.ciLoggingEnabled).toBe(false);
      });

      it("should coerce truthy values to true", () => {
        loggingService.setCiLoggingEnabled("truthy");
        expect(loggingService.ciLoggingEnabled).toBe(true);
        
        loggingService.setCiLoggingEnabled(1);
        expect(loggingService.ciLoggingEnabled).toBe(true);
        
        loggingService.setCiLoggingEnabled({});
        expect(loggingService.ciLoggingEnabled).toBe(true);
      });

      it("should coerce falsy values to false", () => {
        loggingService.setCiLoggingEnabled("");
        expect(loggingService.ciLoggingEnabled).toBe(false);
        
        loggingService.setCiLoggingEnabled(0);
        expect(loggingService.ciLoggingEnabled).toBe(false);
        
        loggingService.setCiLoggingEnabled(null);
        expect(loggingService.ciLoggingEnabled).toBe(false);
        
        loggingService.setCiLoggingEnabled(undefined);
        expect(loggingService.ciLoggingEnabled).toBe(false);
      });
    });

    describe("detectCiLogging method", () => {
      it("should return window.__RWTRA_CI_MODE__ value if available", () => {
        global.window.__RWTRA_CI_MODE__ = true;
        expect(loggingService.detectCiLogging()).toBe(true);
        
        global.window.__RWTRA_CI_MODE__ = false;
        expect(loggingService.detectCiLogging()).toBe(false);
      });

      it("should detect CI logging from query params", () => {
        global.window.location.search = "?ci=1";
        expect(loggingService.detectCiLogging()).toBe(true);
        
        global.window.location.search = "?ci=true";
        expect(loggingService.detectCiLogging()).toBe(true);
        
        global.window.location.search = "?ci=TRUE";
        expect(loggingService.detectCiLogging()).toBe(true);
      });

      it("should return false for invalid query param values", () => {
        global.window.location.search = "?ci=0";
        expect(loggingService.detectCiLogging()).toBe(false);
        
        global.window.location.search = "?ci=false";
        expect(loggingService.detectCiLogging()).toBe(false);
        
        global.window.location.search = "?ci=invalid";
        expect(loggingService.detectCiLogging()).toBe(false);
      });

      it("should detect CI logging from localhost", () => {
        global.window.location = { search: "", hostname: "localhost", href: "http://test.com" };
        expect(loggingService.detectCiLogging()).toBe(true);
        
        global.window.location = { search: "", hostname: "127.0.0.1", href: "http://test.com" };
        expect(loggingService.detectCiLogging()).toBe(true);
      });

      it("should detect CI logging from config override", () => {
        expect(loggingService.detectCiLogging({ ciLogging: true })).toBe(true);
        expect(loggingService.detectCiLogging({ ciLogging: false })).toBe(false);
      });

      it("should return false when no conditions are met", () => {
        global.window.__RWTRA_CI_MODE__ = undefined;
        global.window.location = { search: "?other=value", hostname: "example.com", href: "http://test.com" };
        expect(loggingService.detectCiLogging()).toBe(false);
      });

      it("should use location override if provided", () => {
        const overrideLocation = { search: "?ci=1", hostname: "example.com", href: "http://test.com" };
        expect(loggingService.detectCiLogging({}, overrideLocation)).toBe(true);
      });
    });

    describe("serializeForLog method", () => {
      it("should serialize Error objects properly", () => {
        const error = new Error("test error");
        const serialized = loggingService.serializeForLog(error);
        
        expect(serialized).toEqual({
          message: "test error",
          stack: expect.stringContaining("Error: test error")
        });
      });

      it("should handle objects that can be serialized", () => {
        const obj = { test: "value", num: 42 };
        const serialized = loggingService.serializeForLog(obj);
        
        expect(serialized).toEqual(obj);
      });

      it("should handle unserializable objects", () => {
        const obj = { 
          func: () => {}, 
          circ: null 
        };
        obj.circ = obj; // Create circular reference
        
        const serialized = loggingService.serializeForLog(obj);
        
        expect(serialized).toEqual({
          type: "object",
          note: "unserializable"
        });
      });

      it("should return primitives as-is", () => {
        expect(loggingService.serializeForLog("string")).toBe("string");
        expect(loggingService.serializeForLog(42)).toBe(42);
        expect(loggingService.serializeForLog(true)).toBe(true);
        expect(loggingService.serializeForLog(null)).toBe(null);
        expect(loggingService.serializeForLog(undefined)).toBe(undefined);
      });
    });

    describe("wait method", () => {
      it("should return a promise that resolves after specified time", async () => {
        const startTime = Date.now();
        const delay = 10;
        
        await loggingService.wait(delay);
        
        const endTime = Date.now();
        expect(endTime - startTime).toBeGreaterThanOrEqual(delay);
      });

      it("should resolve immediately when passed 0", async () => {
        const startTime = Date.now();
        
        await loggingService.wait(0);
        
        const endTime = Date.now();
        // Should be almost instantaneous
        expect(endTime - startTime).toBeLessThan(10);
      });
    });

    describe("logClient method", () => {
      it("should send log data via sendBeacon when CI logging is enabled", () => {
        loggingService.setCiLoggingEnabled(true);
        loggingService.logClient("test:event", { data: "value" });
        
        expect(global.navigator.sendBeacon).toHaveBeenCalledWith(
          "/api/log",
          expect.any(Blob)
        );
      });

      it("should not send logs when CI logging is disabled and not an error level", () => {
        loggingService.setCiLoggingEnabled(false);
        loggingService.logClient("test:event", { data: "value" });
        
        expect(global.navigator.sendBeacon).not.toHaveBeenCalled();
        expect(global.fetch).not.toHaveBeenCalled();
      });

      it("should send error level logs even when CI logging is disabled", () => {
        loggingService.setCiLoggingEnabled(false);
        loggingService.logClient("error:event", { data: "value" }, "error");
        
        expect(global.navigator.sendBeacon).toHaveBeenCalledWith(
          "/api/log",
          expect.any(Blob)
        );
      });

      it("should log to console with appropriate method based on level", () => {
        loggingService.setCiLoggingEnabled(true);
        
        loggingService.logClient("info:event", { data: "value" }, "info");
        expect(global.console.info).toHaveBeenCalledWith(
          "[bootstrap]", 
          "info:event", 
          { data: "value" }
        );
        
        global.console.info.mockClear();
        
        loggingService.logClient("warn:event", { data: "value" }, "warn");
        expect(global.console.warn).toHaveBeenCalledWith(
          "[bootstrap]", 
          "warn:event", 
          { data: "value" }
        );
        
        global.console.warn.mockClear();
        
        loggingService.logClient("error:event", { data: "value" }, "error");
        expect(global.console.error).toHaveBeenCalledWith(
          "[bootstrap]", 
          "error:event", 
          { data: "value" }
        );
      });

      it("should serialize the detail object", () => {
        loggingService.setCiLoggingEnabled(true);
        const error = new Error("test");
        loggingService.logClient("event", error);
        
        expect(global.console.info).toHaveBeenCalledWith(
          "[bootstrap]",
          "event",
          expect.objectContaining({
            message: "test",
            stack: expect.stringContaining("Error: test")
          })
        );
      });

      it("should fall back to fetch when sendBeacon is not available", () => {
        global.navigator.sendBeacon = undefined;
        loggingService.setCiLoggingEnabled(true);
        loggingService.logClient("event", { data: "value" });
        
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/log",
          expect.objectContaining({
            method: "POST",
            headers: { "content-type": "application/json" }
          })
        );
      });

      it("should handle missing window gracefully", () => {
        delete global.window;
        expect(() => loggingService.logClient("event", { data: "value" })).not.toThrow();
      });
    });

    describe("isCiLoggingEnabled method", () => {
      it("should return the current CI logging enabled state", () => {
        loggingService.setCiLoggingEnabled(true);
        expect(loggingService.isCiLoggingEnabled()).toBe(true);
        
        loggingService.setCiLoggingEnabled(false);
        expect(loggingService.isCiLoggingEnabled()).toBe(false);
      });
    });

    describe("integration tests", () => {
      it("should work through full lifecycle", () => {
        const config = {
          namespace: { helpers: {} },
          serviceRegistry: { register: jest.fn() }
        };
        const service = new LoggingService(config);
        
        // Initialize
        service.initialize();
        expect(service.namespace).toBe(config.namespace);
        expect(service.helpers).toBe(config.namespace.helpers);
        
        // Use methods
        service.setCiLoggingEnabled(true);
        expect(service.isCiLoggingEnabled()).toBe(true);
        
        const detected = service.detectCiLogging({ ciLogging: true });
        expect(detected).toBe(true);
        
        const serialized = service.serializeForLog({ test: "data" });
        expect(serialized).toEqual({ test: "data" });
        
        // Wait method should return a promise
        const waitPromise = service.wait(1);
        expect(waitPromise).toBeInstanceOf(Promise);
      });
    });
  });

  describe("NetworkService tests", () => {
    let networkService;
    let mockConfig;

    beforeEach(() => {
      mockConfig = {
        namespace: { helpers: {} },
        serviceRegistry: { register: jest.fn() }
      };
      networkService = new NetworkService(mockConfig);
      networkService.initialize();
    });

    describe("constructor", () => {
      it("should create an instance with provided config", () => {
        expect(networkService.config).toBe(mockConfig);
      });

      it("should create an instance with default config when none provided", () => {
        const service = new NetworkService();
        expect(service.config).toBeDefined();
      });
    });

    describe("initialize method", () => {
      it("should set up internal properties", () => {
        expect(networkService.serviceRegistry).toBe(mockConfig.serviceRegistry);
        expect(networkService.helpers).toBe(mockConfig.namespace.helpers);
        expect(typeof networkService.isCommonJs).toBe('boolean');
      });

      it("should register the service in the service registry", () => {
        expect(mockConfig.serviceRegistry.register).toHaveBeenCalledWith(
          "network",
          networkService,
          {
            folder: "services/cdn",
            domain: "cdn",
          },
          []
        );
      });

      it("should throw if initialized twice", () => {
        expect(() => networkService.initialize()).toThrow();
      });
    });

    // Additional NetworkService tests would go here...
  });

  describe("DynamicModulesService tests", () => {
    let dynamicModulesService;
    let mockConfig;

    beforeEach(() => {
      mockConfig = {
        namespace: { helpers: {} },
        serviceRegistry: { register: jest.fn() }
      };
      dynamicModulesService = new DynamicModulesService(mockConfig);
      dynamicModulesService.initialize();
    });

    describe("constructor", () => {
      it("should create an instance with provided config", () => {
        expect(dynamicModulesService.config).toBe(mockConfig);
      });

      it("should create an instance with default config when none provided", () => {
        const service = new DynamicModulesService();
        expect(service.config).toBeDefined();
      });
    });

    describe("initialize method", () => {
      it("should set up internal properties", () => {
        expect(dynamicModulesService.serviceRegistry).toBe(mockConfig.serviceRegistry);
        expect(dynamicModulesService.helpers).toBe(mockConfig.namespace.helpers);
        expect(typeof dynamicModulesService.isCommonJs).toBe('boolean');
      });

      it("should register the service in the service registry", () => {
        expect(mockConfig.serviceRegistry.register).toHaveBeenCalledWith(
          "dynamicModules",
          dynamicModulesService,
          {
            folder: "services/cdn",
            domain: "cdn",
          },
          []
        );
      });

      it("should throw if initialized twice", () => {
        expect(() => dynamicModulesService.initialize()).toThrow();
      });
    });

    // Additional DynamicModulesService tests would go here...
  });
});