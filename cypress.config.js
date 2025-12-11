const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    specPattern: "cypress/e2e/**/*.cy.{js,ts}",
    supportFile: "cypress/support/e2e.js",
    baseUrl: "http://127.0.0.1:4173",
    pageLoadTimeout: 120000,
    defaultCommandTimeout: 15000,
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
  },
});
