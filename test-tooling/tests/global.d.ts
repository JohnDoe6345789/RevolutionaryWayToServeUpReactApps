export {};

declare global {
  var __RWTRA_PROXY_MODE__: "proxy" | "direct" | undefined;
  var __rwtraBootstrap: { helpers: Record<string, unknown> } | undefined;
}
