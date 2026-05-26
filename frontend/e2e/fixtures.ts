import type { Page } from "@playwright/test";

export const MOCK_USER = {
  id: 1,
  email: "alice@school.edu",
  full_name: "Alice Student",
  role: "student",
  avatar: null,
};

export const MOCK_NOTE = {
  id: 1,
  title: "Study notes",
  content: "Important stuff to remember",
  author: 1,
  author_name: "Alice Student",
  subject: null,
  subject_name: "",
  visibility: "private",
  lesson_date: null,
  created_at: "2025-01-01T10:00:00Z",
  updated_at: "2025-01-15T10:00:00Z",
  tags: "",
};

export const MOCK_ASSIGNMENT = {
  id: 1,
  title: "Chapter 5 Homework",
  description: "Read and summarize pages 80–100",
  assignment_type: "homework",
  subject: 1,
  subject_name: "Math",
  school_class: 1,
  assigned_by: 1,
  assigned_by_name: "Mr. Smith",
  due_date: "2025-12-31T23:59:00Z",
  max_score: 100,
  is_graded: false,
  is_overdue: false,
};

export const MOCK_GRADE = {
  id: 1,
  student: 1,
  student_name: "Alice Student",
  subject: 1,
  subject_name: "Math",
  value: 88,
  max_value: 100,
  label: "A",
  date: "2025-01-15",
  is_final: false,
};

/**
 * Inject Zustand persist state and raw tokens into localStorage before the
 * page loads. The auth store uses the "auth-storage" key for its persist
 * middleware, so setting it here is enough for RequireAuth to see
 * isAuthenticated === true on first render.
 */
export async function setupAuth(page: Page) {
  await page.addInitScript((user) => {
    const authState = {
      state: {
        user,
        accessToken: "test-access-token",
        refreshToken: "test-refresh-token",
        isAuthenticated: true,
      },
      version: 0,
    };
    localStorage.setItem("auth-storage", JSON.stringify(authState));
    localStorage.setItem("access_token", "test-access-token");
    localStorage.setItem("refresh_token", "test-refresh-token");
  }, MOCK_USER);
}

/** Silence all API calls that aren't explicitly mocked in a test. */
export async function catchAllApi(page: Page) {
  await page.route(/\/api\/(timetable|attendance|materials|chat|assignments|notes|accounts)\//, (route) => {
    if (!route.request().isNavigationRequest()) {
      route.fulfill({ json: [] });
    } else {
      route.continue();
    }
  });
}
