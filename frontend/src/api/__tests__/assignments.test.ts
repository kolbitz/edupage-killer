import MockAdapter from "axios-mock-adapter";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import apiClient from "../client";
import {
  getAssignments,
  getAssignment,
  createAssignment,
  getSubmissions,
  submitAssignment,
  getGrades,
} from "../assignments";

describe("assignments api", () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.restore();
  });

  it("getAssignments calls GET /assignments/", async () => {
    mock.onGet("/assignments/").reply(200, []);
    const res = await getAssignments();
    expect(res.data).toEqual([]);
  });

  it("getAssignments passes optional params", async () => {
    mock.onGet("/assignments/").reply(200, []);
    await getAssignments({ subject: "1", page: 2 });
    expect(mock.history.get[0].params).toEqual({ subject: "1", page: 2 });
  });

  it("getAssignment calls GET /assignments/:id/", async () => {
    mock.onGet("/assignments/5/").reply(200, { id: 5 });
    const res = await getAssignment(5);
    expect(res.data).toEqual({ id: 5 });
  });

  it("createAssignment posts body to /assignments/", async () => {
    const payload = { title: "Homework 1", assignment_type: "homework" as const };
    mock.onPost("/assignments/").reply(201, { id: 1, ...payload });
    const res = await createAssignment(payload);
    expect(JSON.parse(mock.history.post[0].data)).toMatchObject(payload);
    expect(res.data.id).toBe(1);
  });

  it("getSubmissions calls GET /assignments/:id/submissions/", async () => {
    mock.onGet("/assignments/3/submissions/").reply(200, []);
    await getSubmissions(3);
    expect(mock.history.get[0].url).toBe("/assignments/3/submissions/");
  });

  it("submitAssignment posts with multipart/form-data header", async () => {
    mock.onPost("/assignments/2/submissions/").reply(201, { id: 10 });
    const form = new FormData();
    form.append("file", new Blob(["content"]), "homework.pdf");
    await submitAssignment(2, form);
    expect(mock.history.post[0].headers?.["Content-Type"]).toBe("multipart/form-data");
    expect(mock.history.post[0].url).toBe("/assignments/2/submissions/");
  });

  it("getGrades calls GET /assignments/grades/", async () => {
    mock.onGet("/assignments/grades/").reply(200, []);
    await getGrades();
    expect(mock.history.get[0].url).toBe("/assignments/grades/");
  });

  it("getGrades passes optional params", async () => {
    mock.onGet("/assignments/grades/").reply(200, []);
    await getGrades({ subject: "math" });
    expect(mock.history.get[0].params).toEqual({ subject: "math" });
  });
});
