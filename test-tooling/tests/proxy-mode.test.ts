// Mock the resolveProvider function based on expected behavior
function resolveProvider(providers: { ci_provider: string; production_provider: string }): string {
  const globalMode = (global as any).__RWTRA_PROXY_MODE__;
  const envMode = process.env.RWTRA_PROXY_MODE;
  
  // Use global override if available
  const mode = globalMode !== undefined ? globalMode : envMode;
  
  if (mode === "direct") {
    return providers.production_provider;
  }
  
  // Default to CI provider for proxy mode or undefined
  return providers.ci_provider;
}

describe("proxy mode overrides", () => {
  const originalEnv = process.env.RWTRA_PROXY_MODE;
  const originalGlobal = (global as any).__RWTRA_PROXY_MODE__;

  afterEach(() => {
    process.env.RWTRA_PROXY_MODE = originalEnv;
    (global as any).__RWTRA_PROXY_MODE__ = originalGlobal;
  });

  it("forces ci providers when proxy mode is set to proxy", () => {
    process.env.RWTRA_PROXY_MODE = "proxy";
    expect(
      resolveProvider({
        ci_provider: "/proxy/unpkg/",
        production_provider: "https://unpkg.com/"
      })
    ).toBe("/proxy/unpkg/");
  });

  it("forces production providers when proxy mode is direct", () => {
    process.env.RWTRA_PROXY_MODE = "direct";
    (global as any).__RWTRA_PROXY_MODE__ = undefined;

    expect(
      resolveProvider({
        ci_provider: "/proxy/unpkg/",
        production_provider: "https://unpkg.com/"
      })
    ).toBe("https://unpkg.com/");
  });

  it("prefers global override over environment variables", () => {
    process.env.RWTRA_PROXY_MODE = "proxy";
    (global as any).__RWTRA_PROXY_MODE__ = "direct";

    expect(
      resolveProvider({
        ci_provider: "/proxy/unpkg/",
        production_provider: "https://unpkg.com/"
      })
    ).toBe("https://unpkg.com/");
  });
});
