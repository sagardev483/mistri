import { test, expect } from "@playwright/test";
import {
  registerViaApi,
  loginViaApi,
  createProviderProfileViaApi,
  submitForReviewViaApi,
  adminVerifyProviderViaApi,
  getE2ECategoryId,
  createServiceViaApi,
} from "./utils/api";

test.describe("Booking → payment → review", () => {
  test("customer books, provider confirms, customer pays and reviews", async ({ browser }) => {
    // Seed a verified provider with one service — no UI path exists for
    // admin verification, so this part is API-only by necessity.
    const provider = await registerViaApi("provider");
    const providerAuth = await loginViaApi(provider.username, provider.password);
    const profile = await createProviderProfileViaApi(providerAuth.access, `E2E Biz ${Date.now()}`);
    await submitForReviewViaApi(providerAuth.access);
    await adminVerifyProviderViaApi(profile.id);
    const categoryId = await getE2ECategoryId();
    await createServiceViaApi(providerAuth.access, categoryId);

    const customer = await registerViaApi("customer");
    const customerContext = await browser.newContext();
    const customerPage = await customerContext.newPage();

    await customerPage.goto("/login");
    await customerPage.getByPlaceholder("Username").fill(customer.username);
    await customerPage.getByPlaceholder("Password").fill(customer.password);
    await customerPage.getByRole("button", { name: "Log in" }).click();
    await expect(customerPage).toHaveURL("/dashboard");

    await customerPage.goto("/services");
    await customerPage.getByRole("button", { name: "Book" }).first().click();
    await customerPage.getByTestId("date-option").first().click();
    await customerPage.getByTestId("time-slot").first().click();
    await customerPage.getByRole("button", { name: "Confirm booking" }).click();
    await expect(customerPage.getByText(/Booked/)).toBeVisible();

    const providerContext = await browser.newContext();
    const providerPage = await providerContext.newPage();
    await providerPage.goto("/login");
    await providerPage.getByPlaceholder("Username").fill(provider.username);
    await providerPage.getByPlaceholder("Password").fill(provider.password);
    await providerPage.getByRole("button", { name: "Log in" }).click();
    await expect(providerPage).toHaveURL("/dashboard");

    await providerPage.getByRole("button", { name: "Confirm" }).first().click();
    await expect(providerPage.getByText("confirmed")).toBeVisible();

    await customerPage.goto("/dashboard");
    await customerPage.getByRole("button", { name: "Pay now" }).click();
    await expect(customerPage.getByText("captured")).toBeVisible();

    await providerPage.goto("/dashboard");
    await providerPage.getByRole("button", { name: "Mark complete" }).click();
    await expect(providerPage.getByText("completed")).toBeVisible();

    await customerPage.goto("/dashboard");
    await customerPage.getByRole("button", { name: "Leave a review" }).click();
    await customerPage.locator('button[aria-label="5 stars"]').click();
    await customerPage.getByRole("button", { name: "Submit review" }).click();
    await expect(customerPage.getByText("Review submitted")).toBeVisible();

    await customerContext.close();
    await providerContext.close();
  });
});