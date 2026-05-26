import { test, expect } from "@playwright/test";
import { setupAuth, MOCK_ASSIGNMENT } from "./fixtures";

test.describe("navigation", () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    // Silence all data fetches so tests can focus on navigation
    await page.route(/\/api\/(timetable|assignments|notes|attendance|materials|chat|accounts)\//, (route) =>
      route.fulfill({ json: [] }),
    );
  });

  test("dashboard page renders greeting heading", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(
      page.getByRole("heading", { name: /good (morning|afternoon|evening)/i }),
    ).toBeVisible();
  });

  test("sidebar shows user full name and role", async ({ page }) => {
    await page.goto("/dashboard");
    const sidebar = page.getByRole("complementary");
    await expect(sidebar.getByText("Alice Student")).toBeVisible();
    await expect(sidebar.getByText("student", { exact: true })).toBeVisible();
  });

  test("clicking Notes in sidebar navigates to /notes", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("link", { name: "Notes" }).click();
    await expect(page).toHaveURL("/notes");
    await expect(page.getByRole("heading", { name: "Notes" })).toBeVisible();
  });

  test("clicking Assignments in sidebar navigates to /assignments", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("link", { name: "Assignments" }).click();
    await expect(page).toHaveURL("/assignments");
    await expect(page.getByRole("heading", { name: "Assignments & Grades" })).toBeVisible();
  });

  test("clicking Timetable in sidebar navigates to /timetable", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("link", { name: "Timetable" }).click();
    await expect(page).toHaveURL("/timetable");
    await expect(page.getByRole("heading", { name: "Timetable" })).toBeVisible();
  });

  test("clicking Attendance in sidebar navigates to /attendance", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("link", { name: "Attendance" }).click();
    await expect(page).toHaveURL("/attendance");
  });

  test("dashboard shows upcoming assignments from API", async ({ page }) => {
    await page.route(/\/api\/assignments\//, (route) =>
      route.fulfill({ json: [MOCK_ASSIGNMENT] }),
    );
    await page.goto("/dashboard");
    await expect(page.getByText("Chapter 5 Homework")).toBeVisible();
  });

  test("dashboard shows 'All caught up!' when no upcoming assignments", async ({ page }) => {
    await page.route(/\/api\/assignments\//, (route) => route.fulfill({ json: [] }));
    await page.goto("/dashboard");
    await expect(page.getByText("All caught up!")).toBeVisible();
  });
});
