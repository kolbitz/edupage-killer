import { test, expect } from "@playwright/test";
import { setupAuth, MOCK_NOTE } from "./fixtures";

test.describe("notes", () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
  });

  test("shows empty state when no notes returned", async ({ page }) => {
    await page.route(/\/notes\//, (route) => route.fulfill({ json: [] }));
    await page.goto("/notes");
    await expect(page.getByText("No notes yet. Create your first note!")).toBeVisible();
  });

  test("renders notes returned by the API", async ({ page }) => {
    await page.route(/\/notes\//, (route) => route.fulfill({ json: [MOCK_NOTE] }));
    await page.goto("/notes");
    await expect(page.getByText("Study notes")).toBeVisible();
    await expect(page.getByText("Important stuff to remember")).toBeVisible();
    await expect(page.getByText("private")).toBeVisible();
  });

  test("shows 'Untitled note' when note has no title", async ({ page }) => {
    await page.route(/\/notes\//, (route) =>
      route.fulfill({ json: [{ ...MOCK_NOTE, title: "" }] }),
    );
    await page.goto("/notes");
    await expect(page.getByText("Untitled note")).toBeVisible();
  });

  test("New Note button opens the creation form", async ({ page }) => {
    await page.route(/\/notes\//, (route) => route.fulfill({ json: [] }));
    await page.goto("/notes");
    await page.getByRole("button", { name: /new note/i }).click();
    await expect(page.getByPlaceholder("Write your note…")).toBeVisible();
    await expect(page.getByPlaceholder("Note title (optional)")).toBeVisible();
  });

  test("Save button is disabled with empty content", async ({ page }) => {
    await page.route(/\/notes\//, (route) => route.fulfill({ json: [] }));
    await page.goto("/notes");
    await page.getByRole("button", { name: /new note/i }).click();
    await expect(page.getByRole("button", { name: /save/i })).toBeDisabled();
  });

  test("Save button enables once content is typed", async ({ page }) => {
    await page.route(/\/notes\//, (route) => route.fulfill({ json: [] }));
    await page.goto("/notes");
    await page.getByRole("button", { name: /new note/i }).click();
    await page.getByPlaceholder("Write your note…").fill("Some content");
    await expect(page.getByRole("button", { name: /save/i })).toBeEnabled();
  });

  test("submitting the form sends a POST and closes the form", async ({ page }) => {
    let capturedBody: Record<string, unknown> | null = null;

    await page.route(/\/notes\//, async (route) => {
      if (route.request().method() === "POST") {
        capturedBody = JSON.parse(route.request().postData() ?? "{}");
        await route.fulfill({ json: { ...MOCK_NOTE, ...capturedBody } });
      } else {
        await route.fulfill({ json: [] });
      }
    });

    await page.goto("/notes");
    await page.getByRole("button", { name: /new note/i }).click();
    await page.getByPlaceholder("Note title (optional)").fill("My e2e note");
    await page.getByPlaceholder("Write your note…").fill("Written in Playwright");

    const [request] = await Promise.all([
      page.waitForRequest((req) => req.url().includes("/notes/") && req.method() === "POST"),
      page.getByRole("button", { name: /save/i }).click(),
    ]);

    const body = JSON.parse(request.postData() ?? "{}");
    expect(body).toMatchObject({ title: "My e2e note", content: "Written in Playwright" });

    // Form closes after successful save
    await expect(page.getByPlaceholder("Write your note…")).not.toBeVisible();
  });

  test("Cancel button closes the form without posting", async ({ page }) => {
    let postCalled = false;

    await page.route(/\/notes\//, async (route) => {
      if (route.request().method() === "POST") {
        postCalled = true;
        await route.fulfill({ json: {} });
      } else {
        await route.fulfill({ json: [] });
      }
    });

    await page.goto("/notes");
    await page.getByRole("button", { name: /new note/i }).click();
    await page.getByPlaceholder("Write your note…").fill("Oops");
    await page.getByRole("button", { name: /cancel/i }).click();

    await expect(page.getByPlaceholder("Write your note…")).not.toBeVisible();
    expect(postCalled).toBe(false);
  });

  test("delete button sends a DELETE request", async ({ page }) => {
    await page.route(/\/notes\//, async (route) => {
      const method = route.request().method();
      if (method === "DELETE") {
        await route.fulfill({ status: 204, body: "" });
      } else {
        await route.fulfill({ json: [MOCK_NOTE] });
      }
    });

    await page.goto("/notes");
    await expect(page.getByText("Study notes")).toBeVisible();

    const [deleteRequest] = await Promise.all([
      page.waitForRequest((req) => req.url().includes("/notes/") && req.method() === "DELETE"),
      // The only button without a label is the trash icon button
      page.locator("button.text-gray-300").click(),
    ]);

    expect(deleteRequest.url()).toMatch(/\/notes\/\d+\//);
  });
});
