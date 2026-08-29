import { test, expect } from "@playwright/test";

test.describe("Language switching", () => {
  test("switching to Nepali updates nav text and persists on reload", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Services" })).toBeVisible();

    await page.getByTestId("locale-ne").click();
    await expect(page.getByRole("link", { name: "सेवाहरू" })).toBeVisible();

    await page.reload();
    await expect(page.getByRole("link", { name: "सेवाहरू" })).toBeVisible();
  });
});