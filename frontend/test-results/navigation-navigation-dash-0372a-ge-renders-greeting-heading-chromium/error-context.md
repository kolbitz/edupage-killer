# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.spec.ts >> navigation >> dashboard page renders greeting heading
- Location: e2e/navigation.spec.ts:13:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /good (morning|afternoon|evening)/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: /good (morning|afternoon|evening)/i })

```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import { setupAuth, MOCK_ASSIGNMENT } from "./fixtures";
  3  | 
  4  | test.describe("navigation", () => {
  5  |   test.beforeEach(async ({ page }) => {
  6  |     await setupAuth(page);
  7  |     // Silence all data fetches so tests can focus on navigation
  8  |     await page.route(/\/(timetable|assignments|notes|attendance|materials|chat|accounts)\//, (route) =>
  9  |       route.fulfill({ json: [] }),
  10 |     );
  11 |   });
  12 | 
  13 |   test("dashboard page renders greeting heading", async ({ page }) => {
  14 |     await page.goto("/dashboard");
  15 |     await expect(
  16 |       page.getByRole("heading", { name: /good (morning|afternoon|evening)/i }),
> 17 |     ).toBeVisible();
     |       ^ Error: expect(locator).toBeVisible() failed
  18 |   });
  19 | 
  20 |   test("sidebar shows user full name and role", async ({ page }) => {
  21 |     await page.goto("/dashboard");
  22 |     await expect(page.getByText("Alice Student")).toBeVisible();
  23 |     await expect(page.getByText("student")).toBeVisible();
  24 |   });
  25 | 
  26 |   test("clicking Notes in sidebar navigates to /notes", async ({ page }) => {
  27 |     await page.goto("/dashboard");
  28 |     await page.getByRole("link", { name: "Notes" }).click();
  29 |     await expect(page).toHaveURL("/notes");
  30 |     await expect(page.getByRole("heading", { name: "Notes" })).toBeVisible();
  31 |   });
  32 | 
  33 |   test("clicking Assignments in sidebar navigates to /assignments", async ({ page }) => {
  34 |     await page.goto("/dashboard");
  35 |     await page.getByRole("link", { name: "Assignments" }).click();
  36 |     await expect(page).toHaveURL("/assignments");
  37 |     await expect(page.getByRole("heading", { name: "Assignments & Grades" })).toBeVisible();
  38 |   });
  39 | 
  40 |   test("clicking Timetable in sidebar navigates to /timetable", async ({ page }) => {
  41 |     await page.goto("/dashboard");
  42 |     await page.getByRole("link", { name: "Timetable" }).click();
  43 |     await expect(page).toHaveURL("/timetable");
  44 |     await expect(page.getByRole("heading", { name: "Timetable" })).toBeVisible();
  45 |   });
  46 | 
  47 |   test("clicking Attendance in sidebar navigates to /attendance", async ({ page }) => {
  48 |     await page.goto("/dashboard");
  49 |     await page.getByRole("link", { name: "Attendance" }).click();
  50 |     await expect(page).toHaveURL("/attendance");
  51 |   });
  52 | 
  53 |   test("dashboard shows upcoming assignments from API", async ({ page }) => {
  54 |     await page.route(/\/assignments\//, (route) =>
  55 |       route.fulfill({ json: [MOCK_ASSIGNMENT] }),
  56 |     );
  57 |     await page.goto("/dashboard");
  58 |     await expect(page.getByText("Chapter 5 Homework")).toBeVisible();
  59 |   });
  60 | 
  61 |   test("dashboard shows 'All caught up!' when no upcoming assignments", async ({ page }) => {
  62 |     await page.route(/\/assignments\//, (route) => route.fulfill({ json: [] }));
  63 |     await page.goto("/dashboard");
  64 |     await expect(page.getByText("All caught up!")).toBeVisible();
  65 |   });
  66 | });
  67 | 
```