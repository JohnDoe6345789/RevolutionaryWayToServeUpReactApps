import ServiceRegistry from "../../../../bootstrap/services/service-registry.js";

describe("ServiceRegistry", () => {
  let registry: ServiceRegistry;

  beforeEach(() => {
    registry = new ServiceRegistry();
  });

  describe("constructor", () => {
    it("should initialize with an empty backing storage", () => {
      expect(registry.listServices()).toEqual([]);
      expect(registry._services).toBeDefined();
      expect(registry._services.size).toBe(0);
    });
  });

  describe("register method", () => {
    it("should register a named service instance with optional metadata", () => {
      const mockService = { name: "testService" };
      const metadata = { folder: "test", domain: "test" };

      registry.register("testService", mockService, metadata);

      expect(registry.isRegistered("testService")).toBe(true);
      expect(registry.getService("testService")).toBe(mockService);
      expect(registry.getMetadata("testService")).toEqual(metadata);
    });

    it("should register a named service instance without metadata", () => {
      const mockService = { name: "testService" };

      registry.register("testService", mockService);

      expect(registry.isRegistered("testService")).toBe(true);
      expect(registry.getService("testService")).toBe(mockService);
      expect(registry.getMetadata("testService")).toEqual({});
    });

    it("should throw an error when service name is not provided", () => {
      const mockService = { name: "testService" };

      expect(() => {
        registry.register("", mockService);
      }).toThrow("Service name is required");

      expect(() => {
        registry.register(null as any, mockService);
      }).toThrow("Service name is required");

      expect(() => {
        registry.register(undefined as any, mockService);
      }).toThrow("Service name is required");
    });

    it("should throw an error when service with same name already exists", () => {
      const mockService1 = { name: "testService" };
      const mockService2 = { name: "testService" };

      registry.register("testService", mockService1);

      expect(() => {
        registry.register("testService", mockService2);
      }).toThrow("Service already registered: testService");
    });
  });

  describe("getService method", () => {
    it("should return the service instance that was registered under the given name", () => {
      const mockService = { name: "testService" };

      registry.register("testService", mockService);

      expect(registry.getService("testService")).toBe(mockService);
    });

    it("should return undefined when service name does not exist", () => {
      expect(registry.getService("nonExistentService")).toBeUndefined();
    });
  });

  describe("listServices method", () => {
    it("should list the names of every registered service", () => {
      const mockService1 = { name: "testService1" };
      const mockService2 = { name: "testService2" };

      registry.register("testService1", mockService1);
      registry.register("testService2", mockService2);

      const serviceList = registry.listServices();
      expect(serviceList).toContain("testService1");
      expect(serviceList).toContain("testService2");
      expect(serviceList).toHaveLength(2);
    });

    it("should return an empty array when no services are registered", () => {
      expect(registry.listServices()).toEqual([]);
    });
  });

  describe("getMetadata method", () => {
    it("should return metadata that was attached to the named service entry", () => {
      const mockService = { name: "testService" };
      const metadata = { folder: "test", domain: "test" };

      registry.register("testService", mockService, metadata);

      expect(registry.getMetadata("testService")).toEqual(metadata);
    });

    it("should return empty object when no metadata was provided", () => {
      const mockService = { name: "testService" };

      registry.register("testService", mockService);

      expect(registry.getMetadata("testService")).toEqual({});
    });

    it("should return undefined when service name does not exist", () => {
      expect(registry.getMetadata("nonExistentService")).toBeUndefined();
    });
  });

  describe("isRegistered method", () => {
    it("should return true when a service with the given name exists", () => {
      const mockService = { name: "testService" };

      registry.register("testService", mockService);

      expect(registry.isRegistered("testService")).toBe(true);
    });

    it("should return false when a service with the given name does not exist", () => {
      expect(registry.isRegistered("nonExistentService")).toBe(false);
    });
  });

  describe("reset method", () => {
    it("should remove all registered services", () => {
      const mockService1 = { name: "testService1" };
      const mockService2 = { name: "testService2" };

      registry.register("testService1", mockService1);
      registry.register("testService2", mockService2);

      expect(registry.listServices()).toHaveLength(2);

      registry.reset();

      expect(registry.listServices()).toEqual([]);
      expect(registry.isRegistered("testService1")).toBe(false);
      expect(registry.isRegistered("testService2")).toBe(false);
    });

    it("should allow registry to be reused after reset", () => {
      const mockService1 = { name: "testService1" };
      const mockService2 = { name: "testService2" };

      registry.register("testService1", mockService1);
      registry.reset();
      registry.register("testService2", mockService2);

      expect(registry.isRegistered("testService1")).toBe(false);
      expect(registry.isRegistered("testService2")).toBe(true);
      expect(registry.getService("testService2")).toBe(mockService2);
    });
  });

  describe("integration tests", () => {
    it("should work through full lifecycle of registering, retrieving, and managing services", () => {
      const service1 = { id: 1, name: "service1" };
      const service2 = { id: 2, name: "service2" };
      const metadata1 = { folder: "services/core", domain: "core" };
      const metadata2 = { folder: "services/cdn", domain: "cdn" };

      // Register services
      registry.register("service1", service1, metadata1);
      registry.register("service2", service2, metadata2);

      // Verify they are registered
      expect(registry.isRegistered("service1")).toBe(true);
      expect(registry.isRegistered("service2")).toBe(true);

      // Verify services can be retrieved
      expect(registry.getService("service1")).toBe(service1);
      expect(registry.getService("service2")).toBe(service2);

      // Verify metadata is stored correctly
      expect(registry.getMetadata("service1")).toEqual(metadata1);
      expect(registry.getMetadata("service2")).toEqual(metadata2);

      // Verify service listing works
      const serviceList = registry.listServices();
      expect(serviceList).toContain("service1");
      expect(serviceList).toContain("service2");
      expect(serviceList).toHaveLength(2);

      // Reset and verify it's empty
      registry.reset();
      expect(registry.listServices()).toEqual([]);
      expect(registry.isRegistered("service1")).toBe(false);
      expect(registry.isRegistered("service2")).toBe(false);
    });
  });
});