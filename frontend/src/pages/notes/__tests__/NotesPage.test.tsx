import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderWithQuery } from "@/test-utils";
import { getNotes, createNote, deleteNote } from "@/api/notes";
import NotesPage from "../NotesPage";
import type { Note } from "@/types";

vi.mock("@/api/notes");

const baseNote: Note = {
  id: 1,
  title: "Test Note",
  content: "Some content here",
  author: 1,
  author_name: "Alice",
  subject: null,
  subject_name: "",
  visibility: "private",
  lesson_date: null,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-15T00:00:00Z",
  tags: "",
};

describe("NotesPage", () => {
  beforeEach(() => {
    vi.mocked(getNotes).mockResolvedValue({ data: [baseNote] } as any);
    vi.mocked(createNote).mockResolvedValue({ data: baseNote } as any);
    vi.mocked(deleteNote).mockResolvedValue({ data: undefined } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state before notes arrive", () => {
    vi.mocked(getNotes).mockReturnValue(new Promise(() => {}));
    renderWithQuery(<NotesPage />);
    expect(screen.getByText("Loading notes…")).toBeInTheDocument();
  });

  it("shows empty state when no notes exist", async () => {
    vi.mocked(getNotes).mockResolvedValue({ data: [] } as any);
    renderWithQuery(<NotesPage />);
    await waitFor(() =>
      expect(screen.getByText("No notes yet. Create your first note!")).toBeInTheDocument()
    );
  });

  it("renders the note list", async () => {
    renderWithQuery(<NotesPage />);
    await waitFor(() => expect(screen.getByText("Test Note")).toBeInTheDocument());
    expect(screen.getByText("Some content here")).toBeInTheDocument();
  });

  it("shows 'Untitled note' for notes with no title", async () => {
    vi.mocked(getNotes).mockResolvedValue({ data: [{ ...baseNote, title: "" }] } as any);
    renderWithQuery(<NotesPage />);
    await waitFor(() => expect(screen.getByText("Untitled note")).toBeInTheDocument());
  });

  it("opens the new note form when New Note is clicked", async () => {
    const user = userEvent.setup();
    renderWithQuery(<NotesPage />);
    await waitFor(() => screen.getByText("Test Note"));

    await user.click(screen.getByRole("button", { name: /new note/i }));
    expect(screen.getByPlaceholderText("Write your note…")).toBeInTheDocument();
  });

  it("Save is disabled when content is empty", async () => {
    const user = userEvent.setup();
    renderWithQuery(<NotesPage />);
    await waitFor(() => screen.getByText("Test Note"));

    await user.click(screen.getByRole("button", { name: /new note/i }));
    expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
  });

  it("Save is enabled once content is typed", async () => {
    const user = userEvent.setup();
    renderWithQuery(<NotesPage />);
    await waitFor(() => screen.getByText("Test Note"));

    await user.click(screen.getByRole("button", { name: /new note/i }));
    await user.type(screen.getByPlaceholderText("Write your note…"), "My content");
    expect(screen.getByRole("button", { name: /save/i })).not.toBeDisabled();
  });

  it("calls createNote with form values and closes the form on save", async () => {
    const user = userEvent.setup();
    renderWithQuery(<NotesPage />);
    await waitFor(() => screen.getByText("Test Note"));

    await user.click(screen.getByRole("button", { name: /new note/i }));
    await user.type(screen.getByPlaceholderText("Note title (optional)"), "New title");
    await user.type(screen.getByPlaceholderText("Write your note…"), "New content");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() =>
      expect(vi.mocked(createNote).mock.calls[0][0]).toMatchObject({
        content: "New content",
        title: "New title",
      })
    );
    await waitFor(() =>
      expect(screen.queryByPlaceholderText("Write your note…")).not.toBeInTheDocument()
    );
  });

  it("Cancel closes the form without saving", async () => {
    const user = userEvent.setup();
    renderWithQuery(<NotesPage />);
    await waitFor(() => screen.getByText("Test Note"));

    await user.click(screen.getByRole("button", { name: /new note/i }));
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(screen.queryByPlaceholderText("Write your note…")).not.toBeInTheDocument();
    expect(createNote).not.toHaveBeenCalled();
  });

  it("calls deleteNote when the delete button is clicked", async () => {
    const user = userEvent.setup();
    renderWithQuery(<NotesPage />);
    await waitFor(() => screen.getByText("Test Note"));

    // buttons[0] = "New Note", buttons[1] = per-note trash button
    const buttons = screen.getAllByRole("button");
    await user.click(buttons[1]);

    await waitFor(() => expect(vi.mocked(deleteNote).mock.calls[0][0]).toBe(1));
  });

  it("renders comma-separated tags as individual chips", async () => {
    vi.mocked(getNotes).mockResolvedValue({
      data: [{ ...baseNote, tags: "math, science, history" }],
    } as any);
    renderWithQuery(<NotesPage />);
    await waitFor(() => expect(screen.getByText("math")).toBeInTheDocument());
    expect(screen.getByText("science")).toBeInTheDocument();
    expect(screen.getByText("history")).toBeInTheDocument();
  });
});
