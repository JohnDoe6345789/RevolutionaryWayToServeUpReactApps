# RevolutionaryWayToServeUpReactApps
![CI](https://github.com/JohnDoe6345789/RevolutionaryWayToServeUpReactApps/actions/workflows/ci.yml/badge.svg)
![Docker build](https://github.com/JohnDoe6345789/RevolutionaryWayToServeUpReactApps/actions/workflows/docker-build.yml/badge.svg)
![Node.js](https://img.shields.io/badge/node-18-blue)
![License](https://img.shields.io/github/license/JohnDoe6345789/RevolutionaryWayToServeUpReactApps)

Revolutionary Way To Serve Up React Apps packages a RetroDeck-style landing page that is rendered entirely in the browser and validated by a Playwright smoke test that spins up the exact bundle created at runtime via `bootstrap.js`.

## What is inside

- `bootstrap.js` compiles the TSX/SCSS sources and exposes them through a client-rendered entry point served by `http-server`.
- `e2e/tests/page-load.spec.ts` is the Playwright smoke test that verifies the landing page renders and becomes interactive.
- `test-tooling` contains additional unit tests that run in the CI workflow as a preliminary validation.
- `e2e/Dockerfile` builds an environment where `npm run test --prefix e2e` can be executed headlessly with Playwright and the proper browsers.

## Getting started

### Requirements

- Node.js 18 (matched by the official CI workflow).
- Docker 24+ if you plan to build and run the containerized test.

### Install dependencies

```bash
npm install
npm install --prefix test-tooling
npm install --prefix e2e
```

### Run locally

- Start the static server:

  ```bash
  npm run serve
  ```

- In another shell, run the Playwright smoke test with the built bundle:

  ```bash
  npm run test --prefix e2e
  ```

### Run unit tests

```bash
npm test --prefix test-tooling
```

## Dockerized smoke test

The repository ships with a container image that mirrors the GitHub Actions environment and avoids managing local servers:

1. Build the image (Node 18 ensures Playwright runs against the bundled Chromium):

   ```bash
   docker build -f e2e/Dockerfile -t rwtra-e2e .
   ```

2. Execute the containerized smoke test (it starts `http-server`, waits for `/`, and runs `playwright test` via the `e2e` package):

   ```bash
   docker run --rm rwtra-e2e
   ```

   Inside the container the test targets `http://127.0.0.1:4173`, matching the default `http-server` port.

## Continuous integration

- **CI workflow** (`ci.yml`): installs dependencies, runs the `test-tooling` unit suite, installs the Playwright e2e stack, and launches `npm run test --prefix e2e`.
- **Docker image build** (`docker-build.yml`): ensures a reproducible Playwright container can be produced for smoke-testing.

## License

This project is distributed under the terms of the MIT License (see `LICENSE`).
