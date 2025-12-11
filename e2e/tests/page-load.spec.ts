import { expect, test } from "@playwright/test";

test.describe("RetroDeck Client", () => {
  test("renders the hero area after compilation", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    const assertions = [
      "RetroDeck",
      /Press Start/i,
      /Launch Arcade Mode/i,
      /Browse ROM Library/i,
    ];

    for (const matcher of assertions) {
      await expect(page.getByText(matcher)).toBeVisible();
    }
  });
});
