import MockAdapter from "axios-mock-adapter";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import apiClient from "../client";
import { getMyAttendance, getAttendance, recordAttendance } from "../attendance";

describe("attendance api", () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.restore();
  });

  it("getMyAttendance calls GET /attendance/my/", async () => {
    mock.onGet("/attendance/my/").reply(200, []);
    const res = await getMyAttendance();
    expect(res.data).toEqual([]);
  });

  it("getAttendance calls GET /attendance/ with params", async () => {
    mock.onGet("/attendance/").reply(200, { count: 0, next: null, previous: null, results: [] });
    await getAttendance({ date: "2024-09-01" });
    expect(mock.history.get[0].params).toEqual({ date: "2024-09-01" });
  });

  it("getAttendance works without params", async () => {
    mock.onGet("/attendance/").reply(200, { count: 0, next: null, previous: null, results: [] });
    await getAttendance();
    expect(mock.history.get[0].url).toBe("/attendance/");
  });

  it("recordAttendance posts body to /attendance/", async () => {
    const payload = { student: 1, date: "2024-09-01", status: "present" as const, period: 1 };
    mock.onPost("/attendance/").reply(201, { id: 1, ...payload });
    await recordAttendance(payload);
    expect(JSON.parse(mock.history.post[0].data)).toMatchObject(payload);
  });
});
