# RevolutionaryWayToServeUpReactApps
![CI](https://github.com/JohnDoe6345789/RevolutionaryWayToServeUpReactApps/actions/workflows/ci.yml/badge.svg)
![Docker build](https://github.com/JohnDoe6345789/RevolutionaryWayToServeUpReactApps/actions/workflows/docker-build.yml/badge.svg)
![Node.js](https://img.shields.io/badge/node-18-blue)
![License](https://img.shields.io/github/license/JohnDoe6345789/RevolutionaryWayToServeUpReactApps)

Revolutionary Way To Serve Up React Apps packages a RetroDeck-style landing page that is rendered entirely in the browser and validated by a Cypress smoke test that spins up the exact bundle created at runtime via `bootstrap.js`.

## What is inside

- `bootstrap.js` compiles the TSX/SCSS sources and exposes them through a client-rendered entry point served by `http-server`.
- `cypress/e2e/page-load.cy.js` is the smoke test that verifies the landing page renders and becomes interactive.
- `test-tooling` contains additional unit tests that run in the CI workflow as a preliminary validation.
- `Dockerfile` builds an environment where `npm run cy:run` can be executed headlessly with Node 18 and the proper browsers.

## Getting started

### Requirements

- Node.js 18 (matched by the official CI workflow).
- Docker 24+ if you plan to build and run the containerized test.

### Install dependencies

```bash
npm install
npm install --prefix test-tooling
```

### Run locally

- Start the static server:

  ```bash
  npm run serve
  ```

- In another shell, run the Cypress smoke test with the built bundle:

  ```bash
  npm run cy:run
  ```

### Run unit tests

```bash
npm test --prefix test-tooling
```

## Dockerized smoke test

The repository ships with a container image that mirrors the GitHub Actions environment and avoids managing local servers:

1. Build the image (Node 18 ensures the Cypress CLI flags are supported):

   ```bash
   docker build -t rwtra-e2e .
   ```

2. Execute the containerized smoke test (it starts `http-server`, waits for `/`, and runs `cypress run --spec cypress/e2e/page-load.cy.js`):

   ```bash
   docker run --rm rwtra-e2e
   ```

   Inside the container the test targets `http://127.0.0.1:4173`, matching the default `http-server` port.

## Continuous integration

- **CI workflow** (`ci.yml`): installs dependencies, runs the `test-tooling` unit suite, and launches `npm run cy:run`.
- **Docker image build** (`docker-build.yml`): ensures a reproducible container can be produced for smoke-testing.

## License

This project is distributed under the terms of the MIT License (see `LICENSE`).
