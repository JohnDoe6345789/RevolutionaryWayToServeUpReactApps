# RevolutionaryWayToServeUpReactApps
Revolutionary Way To Serve Up React Apps

This repo bundles a client-rendered RetroDeck landing page plus a Cypress smoke test that compiles the TSX/SCSS stack at runtime from `bootstrap.js`.

## Dockerized test run

1. Build the container (uses Node 18 so the Cypress binary accepts the CLI flags):
   ```bash
   docker build -t rwtra-e2e .
   ```
2. Run the Cypress workflow (starts `http-server`, waits for `/`, then runs `cypress run --spec cypress/e2e/page-load.cy.js`):
   ```bash
   docker run --rm rwtra-e2e
   ```
   The test suite already targets the served bundle on `http://127.0.0.1:4173`, which works inside the container.

If you prefer to run locally, `npm run cy:run` still kicks off the server+tests together.
