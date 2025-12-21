# bootstrap/services/local

Local-only services that hydrate the loader with helpers for rendering, dependency loading, and sass/tsx compilation.

## Documents

- [`framework-renderer.md`](framework-renderer.md) – Explains the helper that renders the compiled app into the DOM root.
- [`local-dependency-loader.md`](local-dependency-loader.md) – Details how dependencies are loaded for local modules before execution.
- [`local-loader-service.md`](local-loader-service.md) – Summarizes how the local loader service registers compilers and loader helpers.
- [`local-module-loader-service.md`](local-module-loader-service.md) – Covers the async local module resolution that powers `_async` requests.
- [`local-paths-service.md`](local-paths-service.md) – Documents path utilities that produce candidate directories for local modules.
- [`local-require-builder.md`](local-require-builder.md) – Describes how the `createRequire` builder combines loader, compiler, and CDN helpers.
- [`sass-compiler-service.md`](sass-compiler-service.md) – Highlights the service that compiles SCSS into CSS before rendering.
- [`tsx-compiler-service.md`](tsx-compiler-service.md) – Describes the TSX compiler service that transforms and executes JSX sources.
