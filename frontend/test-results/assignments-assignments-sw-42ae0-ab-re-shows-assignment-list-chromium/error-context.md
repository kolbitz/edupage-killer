# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: assignments.spec.ts >> assignments >> switching back to assignments tab re-shows assignment list
- Location: e2e/assignments.spec.ts:75:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /grades/i })

```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import { setupAuth, MOCK_ASSIGNMENT, MOCK_GRADE } from "./fixtures";
  3  | 
  4  | test.describe("assignments", () => {
  5  |   test.beforeEach(async ({ page }) => {
  6  |     await setupAuth(page);
  7  |     await page.route(/\/assignments\/grades\//, (route) =>
  8  |       route.fulfill({ json: [MOCK_GRADE] }),
  9  |     );
  10 |     await page.route(/\/assignments\//, (route) =>
  11 |       route.fulfill({ json: [MOCK_ASSIGNMENT] }),
  12 |     );
  13 |   });
  14 | 
  15 |   test("shows assignments tab and data by default", async ({ page }) => {
  16 |     await page.goto("/assignments");
  17 |     await expect(page.getByText("Chapter 5 Homework")).toBeVisible();
  18 |     await expect(page.getByText(/Math · by Mr\. Smith/)).toBeVisible();
  19 |   });
  20 | 
  21 |   test("shows empty state when no assignments", async ({ page }) => {
  22 |     await page.route(/\/assignments\//, (route) => route.fulfill({ json: [] }));
  23 |     await page.goto("/assignments");
  24 |     await expect(page.getByText("No assignments yet")).toBeVisible();
  25 |   });
  26 | 
  27 |   test("assignments tab does not fetch grades initially", async ({ page }) => {
  28 |     let gradesFetched = false;
  29 |     await page.route(/\/assignments\/grades\//, (route) => {
  30 |       gradesFetched = true;
  31 |       route.fulfill({ json: [MOCK_GRADE] });
  32 |     });
  33 | 
  34 |     await page.goto("/assignments");
  35 |     await expect(page.getByText("Chapter 5 Homework")).toBeVisible();
  36 |     expect(gradesFetched).toBe(false);
  37 |   });
  38 | 
  39 |   test("switching to Grades tab fetches and displays grades", async ({ page }) => {
  40 |     await page.goto("/assignments");
  41 |     await page.getByRole("button", { name: /grades/i }).click();
  42 |     await expect(page.getByText("A")).toBeVisible();
  43 |     await expect(page.getByText("88/100")).toBeVisible();
  44 |   });
  45 | 
  46 |   test("grade label falls back to numeric value when label is empty", async ({ page }) => {
  47 |     await page.route(/\/assignments\/grades\//, (route) =>
  48 |       route.fulfill({ json: [{ ...MOCK_GRADE, label: "", value: 73 }] }),
  49 |     );
  50 |     await page.goto("/assignments");
  51 |     await page.getByRole("button", { name: /grades/i }).click();
  52 |     await expect(page.getByText("73")).toBeVisible();
  53 |   });
  54 | 
  55 |   test("overdue assignment shows red due-date text", async ({ page }) => {
  56 |     await page.route(/\/assignments\//, (route) =>
  57 |       route.fulfill({ json: [{ ...MOCK_ASSIGNMENT, is_overdue: true }] }),
  58 |     );
  59 |     await page.goto("/assignments");
  60 |     const dueText = page.locator("span.text-red-500", { hasText: /Due/ });
  61 |     await expect(dueText).toBeVisible();
  62 |   });
  63 | 
  64 |   test("non-overdue assignment shows gray due-date text", async ({ page }) => {
  65 |     await page.goto("/assignments");
  66 |     const dueText = page.locator("span.text-gray-500", { hasText: /Due/ });
  67 |     await expect(dueText).toBeVisible();
  68 |   });
  69 | 
  70 |   test("max score is displayed when present", async ({ page }) => {
  71 |     await page.goto("/assignments");
  72 |     await expect(page.getByText("Max: 100 pts")).toBeVisible();
  73 |   });
  74 | 
  75 |   test("switching back to assignments tab re-shows assignment list", async ({ page }) => {
  76 |     await page.goto("/assignments");
> 77 |     await page.getByRole("button", { name: /grades/i }).click();
     |                                                         ^ Error: locator.click: Test timeout of 30000ms exceeded.
  78 |     await expect(page.getByText("A")).toBeVisible();
  79 |     await page.getByRole("button", { name: /assignments/i }).click();
  80 |     await expect(page.getByText("Chapter 5 Homework")).toBeVisible();
  81 |   });
  82 | });
  83 | 
```