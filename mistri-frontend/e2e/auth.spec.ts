import { test, expect } from "@playwright/test";

function uniqueUsername(prefix: string) {
  return `${prefix}_${Date.now()}`;
}

test.describe("Authentication", () => {
  test("a new customer can register, log in, and log out", async ({ page }) => {
    const username = uniqueUsername("e2e_ui_customer");
    const password = "TestPass123!";

    await page.goto("/register");
    await page.getByPlaceholder("Username").fill(username);
    await page.getByPlaceholder("Email").fill(`${username}@example.com`);
    await page.getByPlaceholder(/Password/).fill(password);
    await page.getByRole("button", { name: "Sign up" }).click();

    await expect(page).toHaveURL("/login");

    await page.getByPlaceholder("Username").fill(username);
    await page.getByPlaceholder("Password").fill(password);
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page).toHaveURL("/dashboard");
    await expect(page.getByText(`Welcome, ${username}`)).toBeVisible();

    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page.getByRole("navigation").getByRole("link", { name: "Log in" })).toBeVisible();
  });

  test("wrong password shows an error, not a silent failure", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("Username").fill("nonexistent_user_xyz");
    await page.getByPlaceholder("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page.getByText(/failed|invalid/i)).toBeVisible();
    await expect(page).toHaveURL("/login");
  });
});