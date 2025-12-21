# bootstrap/configs/local

Local loader configurations that guide dependency resolution, compiler wiring, helper registries, and module paths.

## Documents

- [`local-dependency-loader.md`](local-dependency-loader.md) – Explains how the dependency loader resolves overrides and helpers before execution.
- [`local-loader.md`](local-loader.md) – Covers the loader configuration that wires Sass/TSX compilers, path helpers, and module resolution.
- [`local-module-loader.md`](local-module-loader.md) – Documents the loader that fetches local modules, caches compiled bundles, and reports failures.
- [`local-paths.md`](local-paths.md) – Enumerates path utilities that normalize local module specifiers and alias keys.
- [`local-require-builder.md`](local-require-builder.md) – Shows how the builder assembles `require` wrappers that talk to local/CDN loaders.
- [`sass-compiler.md`](sass-compiler.md) – Covers the helper that compiles global SCSS sources before React renders.
- [`tsx-compiler.md`](tsx-compiler.md) – Explains the TSX compiler configuration used when compiling entry files locally.
