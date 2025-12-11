/// <reference types="cypress" />

describe("RetroDeck Client", () => {
  it("renders the hero area after compilation", () => {
    cy.visit("/", { timeout: 120000 });

    cy.contains("RetroDeck", { timeout: 120000 }).should("be.visible");
    cy.contains(/Press Start/i, { timeout: 120000 }).should("be.visible");
    cy.contains(/Launch Arcade Mode/i, { timeout: 120000 }).should("be.visible");
    cy.contains(/Browse ROM Library/i, { timeout: 120000 }).should("be.visible");
  });
});
