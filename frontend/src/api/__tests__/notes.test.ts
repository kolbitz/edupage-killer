import MockAdapter from "axios-mock-adapter";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import apiClient from "../client";
import { getNotes, getNote, createNote, updateNote, deleteNote } from "../notes";

describe("notes api", () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.restore();
  });

  it("getNotes calls GET /notes/", async () => {
    mock.onGet("/notes/").reply(200, []);
    const res = await getNotes();
    expect(res).toEqual([]);
  });

  it("getNotes passes optional params", async () => {
    mock.onGet("/notes/").reply(200, []);
    await getNotes({ subject: "2" });
    expect(mock.history.get[0].params).toEqual({ subject: "2" });
  });

  it("getNote calls GET /notes/:id/", async () => {
    mock.onGet("/notes/7/").reply(200, { id: 7 });
    const res = await getNote(7);
    expect(res.data).toEqual({ id: 7 });
  });

  it("createNote posts body to /notes/", async () => {
    const payload = { content: "Remember to study", visibility: "private" as const };
    mock.onPost("/notes/").reply(201, { id: 1, ...payload });
    await createNote(payload);
    expect(JSON.parse(mock.history.post[0].data)).toMatchObject(payload);
  });

  it("updateNote patches /notes/:id/ with body", async () => {
    mock.onPatch("/notes/4/").reply(200, { id: 4, content: "Updated" });
    await updateNote(4, { content: "Updated" });
    expect(mock.history.patch[0].url).toBe("/notes/4/");
    expect(JSON.parse(mock.history.patch[0].data)).toEqual({ content: "Updated" });
  });

  it("deleteNote calls DELETE /notes/:id/", async () => {
    mock.onDelete("/notes/9/").reply(204);
    await deleteNote(9);
    expect(mock.history.delete[0].url).toBe("/notes/9/");
  });
});
