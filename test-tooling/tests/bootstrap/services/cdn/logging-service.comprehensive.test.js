// Comprehensive test suite for LoggingService class
const LoggingService = require("../../../../../bootstrap/services/cdn/logging-service.js");

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
  mockFn.mockResolvedValue = (value) => {
    mockFn.returnValue = Promise.resolve(value);
    return mockFn;
  };
  mockFn.mockRejectedValue = (error) => {
    mockFn.returnValue = Promise.reject(error);
    return mockFn;
  };
  return mockFn;
}

describe("LoggingService", () => {
  let service;
  let mockConfig;
  let mockServiceRegistry;

  beforeEach(() => {
    mockServiceRegistry = {
      register: createMockFunction()
    };

    mockConfig = {
      namespace: { helpers: {} },
      serviceRegistry: mockServiceRegistry,
      ciLogQueryParam: "ci",
      clientLogEndpoint: "/logs"
    };

    service = new LoggingService(mockConfig);
  });

  describe("constructor", () => {
    test("should create an instance with provided config", () => {
      expect(service).toBeInstanceOf(LoggingService);
      expect(service.config).toBe(mockConfig);
    });

    test("should create an instance with default config when none provided", () => {
      const serviceWithDefault = new LoggingService();
      expect(serviceWithDefault).toBeInstanceOf(LoggingService);
      expect(serviceWithDefault.config).toBeDefined();
    });
  });

  describe("initialize method", () => {
    test("should properly initialize the service with required dependencies", () => {
      const result = service.initialize();

      expect(result).toBe(service);
      expect(service.initialized).toBe(true);
      expect(service.namespace).toBe(mockConfig.namespace);
      expect(service.helpers).toBe(mockConfig.namespace.helpers);
      expect(typeof service.isCommonJs).toBeOneOf(["boolean", "function"]);
      expect(service.ciLoggingEnabled).toBe(false);
      expect(typeof service.setCiLoggingEnabled).toBe("function");
      expect(typeof service.detectCiLogging).toBe("function");
      expect(typeof service.logClient).toBe("function");
      expect(typeof service.wait).toBe("function");
      expect(typeof service.serializeForLog).toBe("function");
      expect(typeof service.isCiLoggingEnabled).toBe("function");
      expect(service.ciLogQueryParam).toBe("ci");
      expect(service.clientLogEndpoint).toBe("/logs");
      expect(service.serviceRegistry).toBe(mockServiceRegistry);
    });

    test("should register the service in the service registry", () => {
      service.initialize();

      expect(mockServiceRegistry.register.calls.length).toBeGreaterThan(0);
      expect(mockServiceRegistry.register.calls[0][0]).toBe("logging");
      expect(mockServiceRegistry.register.calls[0][1]).toBe(service);
      expect(mockServiceRegistry.register.calls[0][2]).toEqual({
        folder: "services/cdn",
        domain: "cdn",
      });
      expect(mockServiceRegistry.register.calls[0][3]).toEqual([]);
    });

    test("should throw if initialized twice", () => {
      service.initialize();

      expect(() => {
        service.initialize();
      }).toThrow();
    });

    test("should use defaults when config properties are missing", () => {
      const configWithoutDefaults = { namespace: { helpers: {} }, serviceRegistry: mockServiceRegistry };
      const serviceWithoutDefaults = new LoggingService(configWithoutDefaults);
      
      serviceWithoutDefaults.initialize();

      // Should get defaults from the static defaults property
      expect(serviceWithoutDefaults.ciLogQueryParam).toBeDefined();
      expect(serviceWithoutDefaults.clientLogEndpoint).toBeDefined();
    });
  });

  describe("setCiLoggingEnabled method", () => {
    test("should enable CI logging when true is passed", () => {
      service.initialize();
      service.setCiLoggingEnabled(true);
      
      expect(service.isCiLoggingEnabled()).toBe(true);
    });

    test("should disable CI logging when false is passed", () => {
      service.initialize();
      service.setCiLoggingEnabled(true); // First enable
      service.setCiLoggingEnabled(false); // Then disable
      
      expect(service.isCiLoggingEnabled()).toBe(false);
    });

    test("should coerce truthy values to true", () => {
      service.initialize();
      service.setCiLoggingEnabled("truthy");
      
      expect(service.isCiLoggingEnabled()).toBe(true);
    });

    test("should coerce falsy values to false", () => {
      service.initialize();
      service.setCiLoggingEnabled(0);
      
      expect(service.isCiLoggingEnabled()).toBe(false);
    });
  });

  describe("detectCiLogging method", () => {
    test("should return window.__RWTRA_CI_MODE__ value if available", () => {
      const originalWindow = global.window;
      global.window = { __RWTRA_CI_MODE__: true };
      
      service.initialize();
      const result = service.detectCiLogging();
      
      expect(result).toBe(true);
      
      global.window = originalWindow;
    });

    test("should return false when window.__RWTRA_CI_MODE__ is false", () => {
      const originalWindow = global.window;
      global.window = { __RWTRA_CI_MODE__: false };
      
      service.initialize();
      const result = service.detectCiLogging();
      
      expect(result).toBe(false);
      
      global.window = originalWindow;
    });

    test("should detect CI logging from query params", () => {
      const locationOverride = { search: "?ci=1" };
      
      service.initialize();
      const result = service.detectCiLogging(null, locationOverride);
      
      expect(result).toBe(true);
    });

    test("should detect CI logging from query params with 'true' value", () => {
      const locationOverride = { search: "?ci=true" };
      
      service.initialize();
      const result = service.detectCiLogging(null, locationOverride);
      
      expect(result).toBe(true);
    });

    test("should detect CI logging from query params with 'TRUE' (case insensitive)", () => {
      const locationOverride = { search: "?ci=TRUE" };
      
      service.initialize();
      const result = service.detectCiLogging(null, locationOverride);
      
      expect(result).toBe(true);
    });

    test("should detect CI logging from localhost hostname", () => {
      const locationOverride = { search: "", hostname: "localhost" };
      
      service.initialize();
      const result = service.detectCiLogging(null, locationOverride);
      
      expect(result).toBe(true);
    });

    test("should detect CI logging from 127.0.0.1 hostname", () => {
      const locationOverride = { search: "", hostname: "127.0.0.1" };
      
      service.initialize();
      const result = service.detectCiLogging(null, locationOverride);
      
      expect(result).toBe(true);
    });

    test("should detect CI logging from config override", () => {
      service.initialize();
      const result = service.detectCiLogging({ ciLogging: true });
      
      expect(result).toBe(true);
    });

    test("should return false when no conditions are met", () => {
      const locationOverride = { search: "", hostname: "example.com" };
      
      service.initialize();
      const result = service.detectCiLogging(null, locationOverride);
      
      expect(result).toBe(false);
    });
  });

  describe("serializeForLog method", () => {
    test("should serialize Error objects properly", () => {
      const error = new Error("Test error");
      service.initialize();
      const result = service.serializeForLog(error);
      
      expect(result).toEqual({
        message: "Test error",
        stack: expect.any(String)
      });
    });

    test("should serialize regular objects", () => {
      const obj = { name: "test", value: 42 };
      service.initialize();
      const result = service.serializeForLog(obj);
      
      expect(result).toEqual(obj);
    });

    test("should handle unserializable objects", () => {
      const obj = { };
      obj.circular = obj; // Creates circular reference
      
      service.initialize();
      const result = service.serializeForLog(obj);
      
      expect(result).toEqual({
        type: "object",
        note: "unserializable"
      });
    });

    test("should return primitives as-is", () => {
      service.initialize();
      
      expect(service.serializeForLog("string")).toBe("string");
      expect(service.serializeForLog(42)).toBe(42);
      expect(service.serializeForLog(true)).toBe(true);
      expect(service.serializeForLog(null)).toBe(null);
      expect(service.serializeForLog(undefined)).toBe(undefined);
    });
  });

  describe("wait method", () => {
    test("should return a promise that resolves after specified time", async () => {
      service.initialize();
      
      const start = Date.now();
      await service.wait(10); // Wait for 10ms
      const end = Date.now();
      
      // The wait should take at least 10ms
      expect(end - start).toBeGreaterThanOrEqual(8); // Allow some tolerance
    });

    test("should resolve immediately when passed 0", async () => {
      service.initialize();
      
      const start = Date.now();
      await service.wait(0);
      const end = Date.now();
      
      // Should resolve quickly
      expect(end - start).toBeLessThan(100);
    });
  });

  describe("logClient method", () => {
    let originalWindow;
    let originalNavigator;
    let originalConsole;

    beforeEach(() => {
      originalWindow = global.window;
      originalNavigator = global.navigator;
      originalConsole = global.console;
      
      global.window = { 
        location: { href: "http://localhost" },
        document: {}
      };
      global.navigator = { sendBeacon: createMockFunction() };
      global.console = { info: createMockFunction(), error: createMockFunction(), warn: createMockFunction() };
    });

    afterEach(() => {
      global.window = originalWindow;
      global.navigator = originalNavigator;
      global.console = originalConsole;
    });

    test("should send log data via sendBeacon when CI logging is enabled", () => {
      service.initialize();
      service.setCiLoggingEnabled(true);
      
      service.logClient("test-event", { data: "value" });
      
      expect(global.navigator.sendBeacon.calls.length).toBeGreaterThan(0);
    });

    test("should not send logs when CI logging is disabled and not an error level", () => {
      service.initialize();
      // CI logging is disabled by default
      service.logClient("test-event", { data: "value" });
      
      // Should not call sendBeacon when CI logging is disabled
      expect(global.navigator.sendBeacon.calls.length).toBe(0);
    });

    test("should send error level logs even when CI logging is disabled", () => {
      service.initialize();
      // CI logging is disabled by default
      service.logClient("error-event", { data: "value" }, "error");
      
      // Should call sendBeacon for error events even when CI logging is disabled
      expect(global.navigator.sendBeacon.calls.length).toBe(1);
    });

    test("should log to console", () => {
      service.initialize();
      service.setCiLoggingEnabled(true);
      
      service.logClient("test-event", { data: "value" }, "error");
      
      expect(global.console.error.calls.length).toBe(1);
      expect(global.console.error.calls[0]).toEqual(["[bootstrap]", "test-event", { data: "value" }]);
    });

    test("should use appropriate console method based on level", () => {
      service.initialize();
      service.setCiLoggingEnabled(true);
      
      service.logClient("info-event", { data: "value" }, "info");
      expect(global.console.info.calls.length).toBe(1);
      expect(global.console.info.calls[0]).toEqual(["[bootstrap]", "info-event", { data: "value" }]);
      
      service.logClient("warn-event", { data: "value" }, "warn");
      expect(global.console.warn.calls.length).toBe(1);
      expect(global.console.warn.calls[0]).toEqual(["[bootstrap]", "warn-event", { data: "value" }]);
      
      service.logClient("error-event", { data: "value" }, "error");
      expect(global.console.error.calls.length).toBe(1);
      expect(global.console.error.calls[0]).toEqual(["[bootstrap]", "error-event", { data: "value" }]);
    });
  });

  describe("isCiLoggingEnabled method", () => {
    test("should return the current CI logging enabled state", () => {
      service.initialize();
      
      expect(service.isCiLoggingEnabled()).toBe(false);
      
      service.setCiLoggingEnabled(true);
      expect(service.isCiLoggingEnabled()).toBe(true);
    });
  });

  describe("static defaults property", () => {
    test("should return the shared logging defaults", () => {
      const defaults = LoggingService.defaults;
      expect(defaults).toBeDefined();
      // We expect it to return the common constants
      expect(typeof defaults).toBe("object");
    });
  });

  describe("integration", () => {
    test("should work through full lifecycle", () => {
      service.initialize();
      
      // Test that the service can detect CI logging
      const result = service.detectCiLogging({ ciLogging: true });
      expect(result).toBe(true);
      
      // Test that serialization works
      const serialized = service.serializeForLog({ test: "value" });
      expect(serialized).toEqual({ test: "value" });
      
      // Test that CI logging can be toggled
      service.setCiLoggingEnabled(true);
      expect(service.isCiLoggingEnabled()).toBe(true);
      
      // Verify that all methods are bound to the service instance
      expect(typeof service.setCiLoggingEnabled).toBe("function");
      expect(typeof service.detectCiLogging).toBe("function");
      expect(typeof service.logClient).toBe("function");
      expect(typeof service.wait).toBe("function");
      expect(typeof service.serializeForLog).toBe("function");
      expect(typeof service.isCiLoggingEnabled).toBe("function");
    });
  });
});