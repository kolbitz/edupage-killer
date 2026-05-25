import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "@/store/auth";
import { login, getMe } from "@/api/auth";
import LoginPage from "../LoginPage";
import type { User } from "@/types";

vi.mock("@/api/auth");

const mockNavigate = vi.hoisted(() => vi.fn());
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockUser: User = {
  id: 1,
  email: "test@school.edu",
  full_name: "Test User",
  role: "student",
  avatar: null,
};

describe("LoginPage", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
    mockNavigate.mockReset();
    localStorage.clear();
    vi.mocked(login).mockResolvedValue({ data: { access: "acc", refresh: "ref" } } as any);
    vi.mocked(getMe).mockResolvedValue({ data: mockUser } as any);
  });

  it("calls login API with entered credentials on submit", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "test@school.edu");
    await user.type(screen.getByLabelText(/password/i), "mypassword");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(login).toHaveBeenCalledWith("test@school.edu", "mypassword"));
  });

  it("fetches user profile after login", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "test@school.edu");
    await user.type(screen.getByLabelText(/password/i), "mypassword");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(getMe).toHaveBeenCalled());
  });

  it("navigates to /dashboard on successful login", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "test@school.edu");
    await user.type(screen.getByLabelText(/password/i), "mypassword");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/dashboard"));
  });

  it("shows error message on failed login", async () => {
    vi.mocked(login).mockRejectedValue(new Error("Unauthorized"));
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "bad@school.edu");
    await user.type(screen.getByLabelText(/password/i), "wrongpass");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(screen.getByText("Invalid credentials. Please try again.")).toBeInTheDocument()
    );
  });

  it("shows loading state while request is in flight", async () => {
    vi.mocked(login).mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "test@school.edu");
    await user.type(screen.getByLabelText(/password/i), "mypassword");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled();
  });

  it("does not show error on initial render", () => {
    render(<LoginPage />);
    expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument();
  });
});
