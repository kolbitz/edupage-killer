import { http, HttpResponse } from "msw";
import type { Note, Submission } from "@/types";
import {
  DEMO_USER,
  SUBJECTS,
  PERIODS,
  TIMETABLE,
  ATTENDANCE,
  MATERIALS,
  CHANNELS,
  MESSAGES,
  ASSIGNMENTS,
  SUBMISSIONS,
  GRADES,
  NOTES,
} from "./data";

// Mutable demo state (session-scoped, resets on page reload)
let notes: Note[] = [...NOTES];
let noteIdCounter = NOTES.length + 1;
const submissions: Submission[] = [...SUBMISSIONS];
const messages = Object.fromEntries(
  Object.entries(MESSAGES).map(([k, v]) => [k, [...v]])
) as typeof MESSAGES;

export const handlers = [
  // Auth
  http.post("/api/auth/login/", () =>
    HttpResponse.json({ access: "demo-access-token", refresh: "demo-refresh-token" })
  ),
  http.post("/api/auth/token/refresh/", () => HttpResponse.json({ access: "demo-access-token" })),

  // Accounts
  http.get("/api/accounts/me/", () => HttpResponse.json(DEMO_USER)),

  // Timetable
  http.get("/api/timetable/my/", () => HttpResponse.json(TIMETABLE)),
  http.get("/api/timetable/entries/", () => HttpResponse.json(TIMETABLE)),
  http.get("/api/timetable/subjects/", () => HttpResponse.json(SUBJECTS)),
  http.get("/api/timetable/periods/", () => HttpResponse.json(PERIODS)),

  // Attendance
  http.get("/api/attendance/my/", () => HttpResponse.json(ATTENDANCE)),
  http.get("/api/attendance/", () => HttpResponse.json(ATTENDANCE)),
  http.post("/api/attendance/", async ({ request }) => {
    const body = (await request.json()) as Partial<(typeof ATTENDANCE)[0]>;
    return HttpResponse.json({ id: 99, ...body }, { status: 201 });
  }),

  // Materials
  http.get("/api/materials/", () => HttpResponse.json(MATERIALS)),
  http.get("/api/materials/:id/", ({ params }) => {
    const material = MATERIALS.find((m) => m.id === Number(params.id));
    return material ? HttpResponse.json(material) : new HttpResponse(null, { status: 404 });
  }),
  http.post("/api/materials/", () => HttpResponse.json(MATERIALS[0], { status: 201 })),
  http.delete("/api/materials/:id/", () => new HttpResponse(null, { status: 204 })),
  http.post("/api/materials/:id/comments/", () =>
    HttpResponse.json(
      { id: 99, content: "", created_at: new Date().toISOString() },
      { status: 201 }
    )
  ),

  // Chat
  http.get("/api/chat/channels/", () => HttpResponse.json(CHANNELS)),
  http.post("/api/chat/channels/", async ({ request }) => {
    const body = (await request.json()) as Partial<(typeof CHANNELS)[0]>;
    return HttpResponse.json(
      { id: 99, member_count: 1, last_message: null, ...body },
      { status: 201 }
    );
  }),
  http.get("/api/chat/channels/:id/messages/", ({ params }) => {
    const channelId = Number(params.id);
    return HttpResponse.json(messages[channelId] ?? []);
  }),
  http.post("/api/chat/channels/:id/messages/", async ({ request, params }) => {
    const body = (await request.json()) as { content: string; reply_to?: number };
    const channelId = Number(params.id);
    const newMsg = {
      id: Date.now(),
      channel: channelId,
      author: DEMO_USER.id,
      author_name: DEMO_USER.full_name,
      content: body.content,
      attachment: null,
      reply_to: body.reply_to ?? null,
      created_at: new Date().toISOString(),
      is_deleted: false,
      reaction_count: 0,
    };
    if (!messages[channelId]) messages[channelId] = [];
    messages[channelId].push(newMsg);
    return HttpResponse.json(newMsg, { status: 201 });
  }),

  // Assignments
  http.get("/api/assignments/", () => HttpResponse.json(ASSIGNMENTS)),
  http.get("/api/assignments/grades/", () => HttpResponse.json(GRADES)),
  http.get("/api/assignments/:id/submissions/", ({ params }) => {
    const assignmentId = Number(params.id);
    return HttpResponse.json(submissions.filter((s) => s.assignment === assignmentId));
  }),
  http.post("/api/assignments/:id/submissions/", async ({ params }) => {
    const sub: Submission = {
      id: Date.now(),
      assignment: Number(params.id),
      student: DEMO_USER.id,
      student_name: DEMO_USER.full_name,
      submitted_at: new Date().toISOString(),
      status: "submitted",
      score: null,
      feedback: "",
    };
    submissions.push(sub);
    return HttpResponse.json(sub, { status: 201 });
  }),

  // Notes
  http.get("/api/notes/", () => HttpResponse.json(notes)),
  http.post("/api/notes/", async ({ request }) => {
    const body = (await request.json()) as Partial<Note>;
    const newNote: Note = {
      id: noteIdCounter++,
      author: DEMO_USER.id,
      author_name: DEMO_USER.full_name,
      subject_name: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: "",
      title: "",
      content: "",
      subject: null,
      visibility: "private",
      lesson_date: null,
      ...body,
    };
    notes.push(newNote);
    return HttpResponse.json(newNote, { status: 201 });
  }),
  http.patch("/api/notes/:id/", async ({ request, params }) => {
    const body = (await request.json()) as Partial<Note>;
    const idx = notes.findIndex((n) => n.id === Number(params.id));
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    notes[idx] = { ...notes[idx], ...body, updated_at: new Date().toISOString() };
    return HttpResponse.json(notes[idx]);
  }),
  http.delete("/api/notes/:id/", ({ params }) => {
    notes = notes.filter((n) => n.id !== Number(params.id));
    return new HttpResponse(null, { status: 204 });
  }),
];
