import "@testing-library/jest-dom";

// Prevent the bootstrap script from executing when imported inside jsdom.
(globalThis as any).__RWTRA_BOOTSTRAP_TEST_MODE__ = true;
if (typeof window !== "undefined") {
  (window as any).__RWTRA_BOOTSTRAP_TEST_MODE__ = true;
}

if (typeof global.fetch !== "function") {
  (global as any).fetch = jest.fn();
}
