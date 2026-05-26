import { test, expect } from "@playwright/test";
import { setupAuth, MOCK_ASSIGNMENT, MOCK_GRADE } from "./fixtures";

test.describe("assignments", () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    // Register the broader handler first; Playwright tries handlers in reverse
    // registration order, so the more-specific /grades/ route must be last.
    await page.route(/\/api\/assignments\//, (route) =>
      route.fulfill({ json: [MOCK_ASSIGNMENT] }),
    );
    await page.route(/\/api\/assignments\/grades\//, (route) =>
      route.fulfill({ json: [MOCK_GRADE] }),
    );
  });

  test("shows assignments tab and data by default", async ({ page }) => {
    await page.goto("/assignments");
    await expect(page.getByText("Chapter 5 Homework")).toBeVisible();
    await expect(page.getByText(/Math · by Mr\. Smith/)).toBeVisible();
  });

  test("shows empty state when no assignments", async ({ page }) => {
    await page.route(/\/api\/assignments\//, (route) => route.fulfill({ json: [] }));
    await page.goto("/assignments");
    await expect(page.getByText("No assignments yet")).toBeVisible();
  });

  test("assignments tab does not fetch grades initially", async ({ page }) => {
    let gradesFetched = false;
    await page.route(/\/api\/assignments\/grades\//, (route) => {
      gradesFetched = true;
      route.fulfill({ json: [MOCK_GRADE] });
    });

    await page.goto("/assignments");
    await expect(page.getByText("Chapter 5 Homework")).toBeVisible();
    expect(gradesFetched).toBe(false);
  });

  test("switching to Grades tab fetches and displays grades", async ({ page }) => {
    await page.goto("/assignments");
    await page.getByRole("button", { name: /grades/i }).click();
    await expect(
      page.getByRole("main").getByText("A", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText("88/100")).toBeVisible();
  });

  test("grade label falls back to numeric value when label is empty", async ({ page }) => {
    await page.route(/\/api\/assignments\/grades\//, (route) =>
      route.fulfill({ json: [{ ...MOCK_GRADE, label: "", value: 73 }] }),
    );
    await page.goto("/assignments");
    await page.getByRole("button", { name: /grades/i }).click();
    await expect(page.getByText("73", { exact: true })).toBeVisible();
  });

  test("overdue assignment shows red due-date text", async ({ page }) => {
    await page.route(/\/api\/assignments\//, (route) =>
      route.fulfill({ json: [{ ...MOCK_ASSIGNMENT, is_overdue: true }] }),
    );
    await page.goto("/assignments");
    const dueText = page.locator("span.text-red-500", { hasText: /Due/ });
    await expect(dueText).toBeVisible();
  });

  test("non-overdue assignment shows gray due-date text", async ({ page }) => {
    await page.goto("/assignments");
    const dueText = page.locator("span.text-gray-500", { hasText: /Due/ });
    await expect(dueText).toBeVisible();
  });

  test("max score is displayed when present", async ({ page }) => {
    await page.goto("/assignments");
    await expect(page.getByText("Max: 100 pts")).toBeVisible();
  });

  test("switching back to assignments tab re-shows assignment list", async ({ page }) => {
    await page.goto("/assignments");
    await page.getByRole("button", { name: /grades/i }).click();
    await expect(
      page.getByRole("main").getByText("A", { exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: /assignments/i }).click();
    await expect(page.getByText("Chapter 5 Homework")).toBeVisible();
  });
});
