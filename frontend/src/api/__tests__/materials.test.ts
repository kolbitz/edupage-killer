import MockAdapter from "axios-mock-adapter";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import apiClient from "../client";
import {
  getMaterials,
  getMaterial,
  uploadMaterial,
  deleteMaterial,
  addComment,
} from "../materials";

describe("materials api", () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.restore();
  });

  it("getMaterials calls GET /materials/ with optional params", async () => {
    mock.onGet("/materials/").reply(200, { count: 0, next: null, previous: null, results: [] });
    await getMaterials({ subject: 1, page: 2 });
    expect(mock.history.get[0].params).toEqual({ subject: 1, page: 2 });
  });

  it("getMaterial calls GET /materials/:id/", async () => {
    mock.onGet("/materials/2/").reply(200, { id: 2 });
    const res = await getMaterial(2);
    expect(res.data).toEqual({ id: 2 });
  });

  it("uploadMaterial posts with multipart/form-data header", async () => {
    mock.onPost("/materials/").reply(201, { id: 3 });
    const form = new FormData();
    form.append("title", "Lecture slides");
    await uploadMaterial(form);
    expect(mock.history.post[0].headers?.["Content-Type"]).toBe("multipart/form-data");
    expect(mock.history.post[0].url).toBe("/materials/");
  });

  it("deleteMaterial calls DELETE /materials/:id/", async () => {
    mock.onDelete("/materials/5/").reply(204);
    await deleteMaterial(5);
    expect(mock.history.delete[0].url).toBe("/materials/5/");
  });

  it("addComment posts content to /materials/:id/comments/", async () => {
    mock.onPost("/materials/8/comments/").reply(201, {});
    await addComment(8, "Very helpful!");
    expect(JSON.parse(mock.history.post[0].data)).toEqual({ content: "Very helpful!" });
    expect(mock.history.post[0].url).toBe("/materials/8/comments/");
  });
});
