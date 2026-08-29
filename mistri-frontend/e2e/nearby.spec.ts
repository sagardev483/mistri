import { test, expect } from "@playwright/test";

test.describe("Nearby providers", () => {
  test("requests location and renders the map once granted", async ({ browser }) => {
    const context = await browser.newContext({
      permissions: ["geolocation"],
      geolocation: { latitude: 27.7172, longitude: 85.324 }, // Kathmandu
    });
    const page = await context.newPage();
    await page.goto("/providers/nearby");

    await expect(page.locator(".leaflet-container")).toBeVisible({ timeout: 10000 });
    await context.close();
  });
});