import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderWithQuery } from "@/test-utils";
import { getAssignments, getGrades } from "@/api/assignments";
import AssignmentsPage from "../AssignmentsPage";
import type { Assignment, Grade } from "@/types";

vi.mock("@/api/assignments");

const baseAssignment: Assignment = {
  id: 1,
  title: "Math Homework",
  description: "Complete exercises 1–10",
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

const baseGrade: Grade = {
  id: 1,
  student: 1,
  student_name: "Alice",
  subject: 1,
  subject_name: "Math",
  value: 85,
  max_value: 100,
  label: "B",
  date: "2025-01-15",
  is_final: false,
};

describe("AssignmentsPage", () => {
  beforeEach(() => {
    vi.mocked(getAssignments).mockResolvedValue([baseAssignment]);
    vi.mocked(getGrades).mockResolvedValue([baseGrade]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shows the assignments tab by default", async () => {
    renderWithQuery(<AssignmentsPage />);
    await waitFor(() => expect(screen.getByText("Math Homework")).toBeInTheDocument());
    expect(screen.getByText("Math Homework")).toBeInTheDocument();
  });

  it("does not fetch grades on initial render", async () => {
    renderWithQuery(<AssignmentsPage />);
    await waitFor(() => screen.getByText("Math Homework"));
    expect(getGrades).not.toHaveBeenCalled();
  });

  it("shows empty state when no assignments exist", async () => {
    vi.mocked(getAssignments).mockResolvedValue([]);
    renderWithQuery(<AssignmentsPage />);
    await waitFor(() => expect(screen.getByText("No assignments yet")).toBeInTheDocument());
  });

  it("shows loading text while assignments are fetching", () => {
    vi.mocked(getAssignments).mockReturnValue(new Promise(() => {}));
    renderWithQuery(<AssignmentsPage />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("renders assignment title, subject, and teacher", async () => {
    renderWithQuery(<AssignmentsPage />);
    await waitFor(() => screen.getByText("Math Homework"));
    expect(screen.getByText(/Math · by Mr\. Smith/)).toBeInTheDocument();
  });

  it("renders assignment description when present", async () => {
    renderWithQuery(<AssignmentsPage />);
    await waitFor(() => screen.getByText("Complete exercises 1–10"));
  });

  it("renders max score when present", async () => {
    renderWithQuery(<AssignmentsPage />);
    await waitFor(() => screen.getByText("Max: 100 pts"));
  });

  it("fetches grades after switching to the Grades tab", async () => {
    const user = userEvent.setup();
    renderWithQuery(<AssignmentsPage />);
    await waitFor(() => screen.getByText("Math Homework"));

    await user.click(screen.getByRole("button", { name: /grades/i }));
    await waitFor(() => expect(getGrades).toHaveBeenCalled());
  });

  it("shows grades table after switching to Grades tab", async () => {
    const user = userEvent.setup();
    renderWithQuery(<AssignmentsPage />);
    await waitFor(() => screen.getByText("Math Homework"));

    await user.click(screen.getByRole("button", { name: /grades/i }));
    await waitFor(() => expect(screen.getByText("B")).toBeInTheDocument());
    expect(screen.getByText("85/100")).toBeInTheDocument();
  });

  it("shows grade label when available, falling back to value", async () => {
    const user = userEvent.setup();
    vi.mocked(getGrades).mockResolvedValue([{ ...baseGrade, label: "", value: 72 }]);
    renderWithQuery(<AssignmentsPage />);
    await waitFor(() => screen.getByText("Math Homework"));

    await user.click(screen.getByRole("button", { name: /grades/i }));
    await waitFor(() => expect(screen.getByText("72")).toBeInTheDocument());
  });

  it("uses red styling for overdue assignments", async () => {
    vi.mocked(getAssignments).mockResolvedValue([{ ...baseAssignment, is_overdue: true }]);
    renderWithQuery(<AssignmentsPage />);
    await waitFor(() => screen.getByText("Math Homework"));

    const dueLine = screen.getByText(/Due/);
    expect(dueLine.className).toContain("text-red-500");
  });

  it("uses gray styling for non-overdue due date", async () => {
    renderWithQuery(<AssignmentsPage />);
    await waitFor(() => screen.getByText("Math Homework"));

    const dueLine = screen.getByText(/Due/);
    expect(dueLine.className).toContain("text-gray-500");
  });
});
