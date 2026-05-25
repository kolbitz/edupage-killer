import { test, expect } from "@playwright/test";
import { MOCK_USER } from "./fixtures";

test.describe("auth", () => {
  test("unauthenticated user visiting /dashboard is redirected to /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL("/login");
  });

  test("unauthenticated user visiting / is redirected to /login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/login");
  });

  test("login page renders form and social buttons", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
    await expect(page.getByText("Continue with Google")).toBeVisible();
    await expect(page.getByText("Continue with GitHub")).toBeVisible();
    await expect(page.getByText("Continue with Facebook")).toBeVisible();
  });

  test("shows error message on failed login", async ({ page }) => {
    await page.route(/\/auth\/login\//, (route) =>
      route.fulfill({ status: 401, json: { detail: "No active account found" } }),
    );
    await page.goto("/login");
    await page.getByLabel("Email").fill("bad@test.com");
    await page.getByLabel("Password").fill("wrongpass");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByText("Invalid credentials. Please try again.")).toBeVisible();
  });

  test("sign in button is disabled while request is in flight", async ({ page }) => {
    // Never-resolving promise simulates a slow network
    await page.route(/\/auth\/login\//, () => new Promise(() => {}));
    await page.goto("/login");
    await page.getByLabel("Email").fill("test@school.edu");
    await page.getByLabel("Password").fill("password");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByRole("button", { name: /signing in/i })).toBeDisabled();
  });

  test("successful login redirects to /dashboard", async ({ page }) => {
    await page.route(/\/auth\/login\//, (route) =>
      route.fulfill({ json: { access: "test-access", refresh: "test-refresh" } }),
    );
    await page.route(/\/accounts\/me\//, (route) => route.fulfill({ json: MOCK_USER }));
    // Silence dashboard data fetches
    await page.route(/\/(timetable|assignments)\//, (route) => route.fulfill({ json: [] }));

    await page.goto("/login");
    await page.getByLabel("Email").fill("alice@school.edu");
    await page.getByLabel("Password").fill("password");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page).toHaveURL("/dashboard");
  });

  test("successful login shows user name in sidebar", async ({ page }) => {
    await page.route(/\/auth\/login\//, (route) =>
      route.fulfill({ json: { access: "test-access", refresh: "test-refresh" } }),
    );
    await page.route(/\/accounts\/me\//, (route) => route.fulfill({ json: MOCK_USER }));
    await page.route(/\/(timetable|assignments)\//, (route) => route.fulfill({ json: [] }));

    await page.goto("/login");
    await page.getByLabel("Email").fill("alice@school.edu");
    await page.getByLabel("Password").fill("password");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page).toHaveURL("/dashboard");
    await expect(page.getByText("Alice Student")).toBeVisible();
    await expect(
      page.getByRole("complementary").getByText("student", { exact: true }),
    ).toBeVisible();
  });
});
