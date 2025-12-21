import LoggingManager from "../../../../../bootstrap/services/core/logging-manager.js";
import LoggingManagerConfig from "../../../../../bootstrap/configs/core/logging-manager.js";

// Mock service registry for testing
class MockServiceRegistry {
  constructor() {
    this.registeredServices = new Map();
  }
  
  register(name, service, metadata) {
    this.registeredServices.set(name, { service, metadata });
  }
  
  getService(name) {
    const entry = this.registeredServices.get(name);
    return entry ? entry.service : null;
  }
}

// Mock window object for testing
class MockWindow {
  constructor() {
    this.eventListeners = {};
    this.__rwtraLog = null;
  }
  
  addEventListener(event, handler) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(handler);
  }
  
  removeEventListener(event, handler) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(h => h !== handler);
    }
  }
  
  triggerEvent(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(handler => handler(data));
    }
  }
}

describe("LoggingManager", () => {
  let loggingManager;
  let mockServiceRegistry;
  let mockLogClient;
  let mockSerializeForLog;

  beforeEach(() => {
    mockServiceRegistry = new MockServiceRegistry();
    mockLogClient = jest.fn();
    mockSerializeForLog = jest.fn(obj => JSON.stringify(obj));
    
    const config = new LoggingManagerConfig({
      logClient: mockLogClient,
      serializeForLog: mockSerializeForLog,
      serviceRegistry: mockServiceRegistry
    });
    
    loggingManager = new LoggingManager(config);
  });

  describe("constructor", () => {
    it("should initialize with provided config", () => {
      expect(loggingManager.config).toBeDefined();
      expect(loggingManager.initialized).toBe(false);
    });

    it("should accept a plain config object", () => {
      const plainConfig = {
        logClient: mockLogClient,
        serializeForLog: mockSerializeForLog,
        serviceRegistry: mockServiceRegistry
      };
      
      const manager = new LoggingManager(plainConfig);
      
      expect(manager.config.logClient).toBe(mockLogClient);
      expect(manager.config.serializeForLog).toBe(mockSerializeForLog);
      expect(manager.config.serviceRegistry).toBe(mockServiceRegistry);
    });

    it("should use default config when none provided", () => {
      // Note: This test may behave differently depending on the default config logic
      const manager = new LoggingManager();
      expect(manager.config).toBeDefined();
    });
  });

  describe("initialize method", () => {
    it("should set up internal properties from config", () => {
      loggingManager.initialize();
      
      expect(loggingManager.logClient).toBe(mockLogClient);
      expect(loggingManager.serializeForLog).toBe(mockSerializeForLog);
      expect(loggingManager.serviceRegistry).toBe(mockServiceRegistry);
      expect(loggingManager.initialized).toBe(true);
    });

    it("should register itself with the service registry", () => {
      loggingManager.initialize();
      
      const registered = mockServiceRegistry.registeredServices.get("loggingManager");
      expect(registered).toBeDefined();
      expect(registered.service).toBe(loggingManager);
      expect(registered.metadata).toEqual({
        folder: "services/core",
        domain: "core"
      });
    });

    it("should throw if service registry is not provided", () => {
      const configWithoutRegistry = new LoggingManagerConfig({
        logClient: mockLogClient,
        serializeForLog: mockSerializeForLog
      });
      
      const manager = new LoggingManager(configWithoutRegistry);
      
      expect(() => manager.initialize()).toThrow("ServiceRegistry required for LoggingManager");
    });

    it("should prevent double initialization", () => {
      loggingManager.initialize();
      
      expect(() => loggingManager.initialize()).toThrow("LoggingManager already initialized");
    });

    it("should return the instance to allow chaining", () => {
      const result = loggingManager.initialize();
      expect(result).toBe(loggingManager);
    });
  });

  describe("install method", () => {
    let mockWindow;

    beforeEach(() => {
      mockWindow = new MockWindow();
      loggingManager.initialize();
    });

    it("should return self when no window is available", () => {
      const result = loggingManager.install(null);
      expect(result).toBe(loggingManager);
    });

    it("should return self when window is undefined", () => {
      const result = loggingManager.install(undefined);
      expect(result).toBe(loggingManager);
    });

    it("should throw if not initialized before install", () => {
      const freshManager = new LoggingManager(loggingManager.config);
      
      expect(() => freshManager.install(mockWindow)).toThrow("LoggingManager not initialized");
    });

    it("should set up window logging when window is provided", () => {
      const result = loggingManager.install(mockWindow);
      
      expect(result).toBe(loggingManager);
      expect(mockWindow.__rwtraLog).toBe(mockLogClient);
      expect(mockWindow.eventListeners.error).toBeDefined();
      expect(mockWindow.eventListeners.unhandledrejection).toBeDefined();
    });

    it("should register error event listener", () => {
      loggingManager.install(mockWindow);
      
      const errorEvent = {
        message: "Test error",
        filename: "test.js",
        lineno: 10,
        colno: 5
      };
      
      mockWindow.triggerEvent('error', errorEvent);
      
      expect(mockLogClient).toHaveBeenCalledWith("window:error", {
        message: "Test error",
        filename: "test.js",
        lineno: 10,
        colno: 5
      });
    });

    it("should register unhandled rejection listener", () => {
      loggingManager.install(mockWindow);
      
      const rejectionEvent = { reason: "Test rejection" };
      
      mockWindow.triggerEvent('unhandledrejection', rejectionEvent);
      
      expect(mockLogClient).toHaveBeenCalledWith("window:unhandledrejection", {
        reason: JSON.stringify("Test rejection")
      });
    });

    it("should handle unhandled rejection without reason", () => {
      loggingManager.install(mockWindow);
      
      const rejectionEvent = {}; // No reason property
      
      mockWindow.triggerEvent('unhandledrejection', rejectionEvent);
      
      expect(mockLogClient).toHaveBeenCalledWith("window:unhandledrejection", {
        reason: JSON.stringify("unknown")
      });
    });

    it("should return self even when window is not provided", () => {
      const result = loggingManager.install(null);
      expect(result).toBe(loggingManager);
    });
  });

  describe("_handleWindowError method", () => {
    beforeEach(() => {
      loggingManager.initialize();
    });

    it("should call logClient with error details", () => {
      const errorEvent = {
        message: "Test error message",
        filename: "test-file.js",
        lineno: 42,
        colno: 8
      };
      
      loggingManager._handleWindowError(errorEvent);
      
      expect(mockLogClient).toHaveBeenCalledWith("window:error", {
        message: "Test error message",
        filename: "test-file.js",
        lineno: 42,
        colno: 8
      });
    });

    it("should handle error event with missing properties", () => {
      const errorEvent = {
        message: "Test error message"
        // Missing other properties
      };
      
      loggingManager._handleWindowError(errorEvent);
      
      expect(mockLogClient).toHaveBeenCalledWith("window:error", {
        message: "Test error message",
        filename: undefined,
        lineno: undefined,
        colno: undefined
      });
    });
  });

  describe("_handleUnhandledRejection method", () => {
    beforeEach(() => {
      loggingManager.initialize();
    });

    it("should call logClient with rejection reason", () => {
      const rejectionEvent = { reason: "Something went wrong" };
      
      loggingManager._handleUnhandledRejection(rejectionEvent);
      
      expect(mockLogClient).toHaveBeenCalledWith("window:unhandledrejection", {
        reason: JSON.stringify("Something went wrong")
      });
    });

    it("should handle rejection event without reason property", () => {
      const rejectionEvent = {};
      
      loggingManager._handleUnhandledRejection(rejectionEvent);
      
      expect(mockLogClient).toHaveBeenCalledWith("window:unhandledrejection", {
        reason: JSON.stringify("unknown")
      });
    });

    it("should handle rejection event with null reason", () => {
      const rejectionEvent = { reason: null };

      loggingManager._handleUnhandledRejection(rejectionEvent);

      expect(mockLogClient).toHaveBeenCalledWith("window:unhandledrejection", {
        reason: JSON.stringify("unknown")
      });
    });

    it("should serialize complex objects", () => {
      const complexObject = { error: new Error("test"), code: 500 };
      const serialized = JSON.stringify(complexObject);
      mockSerializeForLog.mockReturnValue(serialized);
      
      const rejectionEvent = { reason: complexObject };
      
      loggingManager._handleUnhandledRejection(rejectionEvent);
      
      expect(mockSerializeForLog).toHaveBeenCalledWith(complexObject);
      expect(mockLogClient).toHaveBeenCalledWith("window:unhandledrejection", {
        reason: serialized
      });
    });
  });

  describe("integration tests", () => {
    it("should work through full lifecycle", () => {
      // Before initialization
      expect(loggingManager.initialized).toBe(false);
      
      // Initialize
      const initResult = loggingManager.initialize();
      expect(initResult).toBe(loggingManager);
      expect(loggingManager.initialized).toBe(true);
      
      // Verify service was registered
      expect(mockServiceRegistry.registeredServices.get("loggingManager")).toBeDefined();
    });

    it("should handle complete install and error flow", () => {
      loggingManager.initialize();
      const mockWindow = new MockWindow();
      
      // Install logging
      loggingManager.install(mockWindow);
      
      // Verify window was set up
      expect(mockWindow.__rwtraLog).toBe(mockLogClient);
      
      // Trigger an error
      const errorEvent = { message: "Integration test error", filename: "test.js", lineno: 100, colno: 10 };
      mockWindow.triggerEvent('error', errorEvent);
      
      // Verify error was logged
      expect(mockLogClient).toHaveBeenCalledWith("window:error", {
        message: "Integration test error",
        filename: "test.js",
        lineno: 100,
        colno: 10
      });
    });
  });
});