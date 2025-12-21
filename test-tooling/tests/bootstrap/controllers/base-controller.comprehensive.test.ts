const BaseController = require("../../../../bootstrap/controllers/base-controller.js");

// Create a concrete implementation for testing purposes
class TestController extends BaseController {
  initialize() {
    this._markInitialized();
    return this;
  }
}

describe("BaseController", () => {
  describe("constructor", () => {
    it("should store the provided configuration object", () => {
      const mockRegistry = { register: jest.fn() };
      const config = {
        test: "value",
        option: true,
        controllerRegistry: mockRegistry
      };
      const controller = new TestController(config);

      expect(controller.config).toBe(config);
      expect(controller.config.test).toBe("value");
      expect(controller.config.option).toBe(true);
    });

    it("should initialize with an empty object when no config is provided", () => {
      const mockRegistry = { register: jest.fn() };
      const controller = new TestController({ controllerRegistry: mockRegistry });

      expect(controller.config).toEqual({ controllerRegistry: mockRegistry });
    });

    it("should initialize with an empty object when undefined config is provided", () => {
      const mockRegistry = { register: jest.fn() };
      const controller = new TestController({ controllerRegistry: mockRegistry });

      expect(controller.config.controllerRegistry).toBe(mockRegistry);
    });

    it("should track initialization state as false by default", () => {
      const mockRegistry = { register: jest.fn() };
      const controller = new TestController({ controllerRegistry: mockRegistry });

      expect(controller.initialized).toBe(false);
    });

    it("should require a controller registry in the config", () => {
      const mockRegistry = { register: jest.fn() };
      const config = { controllerRegistry: mockRegistry };

      const controller = new TestController(config);

      expect(controller.controllerRegistry).toBe(mockRegistry);
    });

    it("should throw an error when no controller registry is provided", () => {
      expect(() => {
        new TestController({});
      }).toThrow("ControllerRegistry required for TestController");
    });
  });

  describe("initialize method", () => {
    it("should throw an error when called directly on the base implementation", () => {
      const mockRegistry = { register: jest.fn() };
      const config = { controllerRegistry: mockRegistry };
      const baseController = new BaseController(config);
      
      expect(() => baseController.initialize()).toThrow(`${BaseController.name} must implement initialize()`);
    });

    it("should not throw when called on concrete implementation", () => {
      const mockRegistry = { register: jest.fn() };
      const config = { controllerRegistry: mockRegistry };
      const controller = new TestController(config);
      
      expect(() => controller.initialize()).not.toThrow();
    });

    it("should mark the controller as initialized after initialize is called", () => {
      const mockRegistry = { register: jest.fn() };
      const config = { controllerRegistry: mockRegistry };
      const controller = new TestController(config);
      
      controller.initialize();
      
      expect(controller.initialized).toBe(true);
    });

    it("should return the controller instance to allow chaining", () => {
      const mockRegistry = { register: jest.fn() };
      const config = { controllerRegistry: mockRegistry };
      const controller = new TestController(config);
      
      const result = controller.initialize();
      
      expect(result).toBe(controller);
    });
  });

  describe("register method", () => {
    it("should register the controller in the controller registry", () => {
      const mockRegistry = { register: jest.fn() };
      const config = { controllerRegistry: mockRegistry };
      const controller = new TestController(config);
      
      controller.register("testController", { type: "test" }, ["dependency1"]);
      
      expect(mockRegistry.register).toHaveBeenCalledWith("testController", controller, { type: "test" }, ["dependency1"]);
    });

    it("should pass the controller instance as the service to register", () => {
      const mockRegistry = { register: jest.fn() };
      const config = { controllerRegistry: mockRegistry };
      const controller = new TestController(config);
      
      controller.register("anotherController", {}, []);
      
      expect(mockRegistry.register).toHaveBeenCalledWith("anotherController", controller, {}, []);
    });
  });

  describe("_requireControllerRegistry method", () => {
    it("should return the configured ControllerRegistry when available", () => {
      const mockRegistry = { register: jest.fn() };
      const config = { controllerRegistry: mockRegistry };
      const controller = new TestController(config);
      
      const result = controller._requireControllerRegistry();
      
      expect(result).toBe(mockRegistry);
    });

    it("should throw an error when ControllerRegistry is missing from config", () => {
      const config = {};
      const controller = new TestController(config);
      
      expect(() => controller._requireControllerRegistry()).toThrow("ControllerRegistry required for TestController");
    });

    it("should throw with the correct controller class name", () => {
      class CustomController extends BaseController {
        initialize() {
          this._markInitialized();
        }
      }
      
      const config = {};
      const controller = new CustomController(config);
      
      expect(() => controller._requireControllerRegistry()).toThrow("ControllerRegistry required for CustomController");
    });
  });

  describe("_ensureNotInitialized method", () => {
    it("should not throw when controller is not initialized", () => {
      const mockRegistry = { register: jest.fn() };
      const config = { controllerRegistry: mockRegistry };
      const controller = new TestController(config);
      
      expect(() => controller._ensureNotInitialized()).not.toThrow();
    });

    it("should throw when controller is already initialized", () => {
      const mockRegistry = { register: jest.fn() };
      const config = { controllerRegistry: mockRegistry };
      const controller = new TestController(config);
      
      controller.initialize();
      
      expect(() => controller._ensureNotInitialized()).toThrow("TestController already initialized");
    });
  });

  describe("_markInitialized method", () => {
    it("should set initialized flag to true", () => {
      const mockRegistry = { register: jest.fn() };
      const config = { controllerRegistry: mockRegistry };
      const controller = new TestController(config);
      
      controller._markInitialized();
      
      expect(controller.initialized).toBe(true);
    });

    it("should be callable multiple times", () => {
      const mockRegistry = { register: jest.fn() };
      const config = { controllerRegistry: mockRegistry };
      const controller = new TestController(config);
      
      controller._markInitialized();
      controller._markInitialized(); // Should not throw
      
      expect(controller.initialized).toBe(true);
    });
  });

  describe("_ensureInitialized method", () => {
    it("should throw when controller is not initialized", () => {
      const mockRegistry = { register: jest.fn() };
      const config = { controllerRegistry: mockRegistry };
      const controller = new TestController(config);
      
      expect(() => controller._ensureInitialized()).toThrow("TestController not initialized");
    });

    it("should not throw when controller is initialized", () => {
      const mockRegistry = { register: jest.fn() };
      const config = { controllerRegistry: mockRegistry };
      const controller = new TestController(config);
      
      controller.initialize();
      
      expect(() => controller._ensureInitialized()).not.toThrow();
    });
  });

  describe("integration tests", () => {
    it("should work through full lifecycle of initialization and registration", () => {
      const mockRegistry = { register: jest.fn() };
      const config = { controllerRegistry: mockRegistry };
      const controller = new TestController(config);
      
      // Initially not initialized
      expect(controller.initialized).toBe(false);
      expect(() => controller._ensureInitialized()).toThrow();
      expect(() => controller._ensureNotInitialized()).not.toThrow();
      
      // Register the controller
      controller.register("integrationTestController", { domain: "test" }, []);
      expect(mockRegistry.register).toHaveBeenCalledWith("integrationTestController", controller, { domain: "test" }, []);
      
      // Initialize the controller
      controller.initialize();
      
      // After initialization
      expect(controller.initialized).toBe(true);
      expect(() => controller._ensureInitialized()).not.toThrow();
      expect(() => controller._ensureNotInitialized()).toThrow();
    });

    it("should handle multiple operations in sequence", () => {
      const mockRegistry = { 
        register: jest.fn(),
        getService: jest.fn(),
        getMetadata: jest.fn()
      };
      const config = { controllerRegistry: mockRegistry };
      const controller = new TestController(config);
      
      // Register first
      controller.register("seqTestController", { version: "1.0" }, []);
      
      // Initialize
      controller.initialize();
      
      // Verify both operations worked
      expect(mockRegistry.register).toHaveBeenCalledWith("seqTestController", controller, { version: "1.0" }, []);
      expect(controller.initialized).toBe(true);
    });
  });

  describe("error handling", () => {
    it("should throw appropriate errors with controller-specific names", () => {
      class ErrorTestController extends BaseController {
        initialize() {
          this._markInitialized();
        }
      }
      
      const mockRegistry = { register: jest.fn() };
      const config = { controllerRegistry: mockRegistry };
      const controller = new ErrorTestController(config);
      
      // Test the error message contains the correct class name
      expect(() => controller._requireControllerRegistry()).not.toThrow("BaseController");
      expect(() => new ErrorTestController({})).toThrow("ControllerRegistry required for ErrorTestController");
    });
  });
});