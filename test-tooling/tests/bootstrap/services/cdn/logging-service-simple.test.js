// Simple test to verify the module can be imported
const LoggingService = require("../../../../bootstrap/services/cdn/logging-service.js");

describe("LoggingService basic test", () => {
  it("should be able to import the LoggingService", () => {
    expect(LoggingService).toBeDefined();
    expect(typeof LoggingService).toBe("function");
  });
});