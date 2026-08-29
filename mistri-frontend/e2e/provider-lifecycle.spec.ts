import { test, expect } from "@playwright/test";
import { registerViaApi } from "./utils/api";

test.describe("Provider verification lifecycle", () => {
  test("a new provider sees the correct dashboard state at each step", async ({ page }) => {
    const provider = await registerViaApi("provider");

    await page.goto("/login");
    await page.getByPlaceholder("Username").fill(provider.username);
    await page.getByPlaceholder("Password").fill(provider.password);
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL("/dashboard");

    await expect(page.getByText("Set up your provider profile")).toBeVisible();

    await page.getByPlaceholder("Business name").fill(`E2E Lifecycle Biz ${Date.now()}`);
    await page.getByPlaceholder("Years of experience").fill("5");
    await page.getByRole("button", { name: "Create profile" }).click();

    await expect(page.getByText("Profile created")).toBeVisible();
    await page.getByRole("button", { name: "Submit for review" }).click();

    await expect(page.getByText("Under review")).toBeVisible();
  });
});