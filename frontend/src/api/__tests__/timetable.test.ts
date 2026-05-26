import MockAdapter from "axios-mock-adapter";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import apiClient from "../client";
import { getMyTimetable, getTimetableEntries, getSubjects, getPeriods } from "../timetable";

describe("timetable api", () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.restore();
  });

  it("getMyTimetable calls GET /timetable/my/", async () => {
    mock.onGet("/timetable/my/").reply(200, []);
    const res = await getMyTimetable();
    expect(res).toEqual([]);
  });

  it("getTimetableEntries calls GET /timetable/entries/ with params", async () => {
    mock.onGet("/timetable/entries/").reply(200, []);
    await getTimetableEntries({ day: 1, week_type: "A" });
    expect(mock.history.get[0].params).toEqual({ day: 1, week_type: "A" });
  });

  it("getTimetableEntries works without params", async () => {
    mock.onGet("/timetable/entries/").reply(200, []);
    await getTimetableEntries();
    expect(mock.history.get[0].url).toBe("/timetable/entries/");
  });

  it("getSubjects calls GET /timetable/subjects/", async () => {
    mock.onGet("/timetable/subjects/").reply(200, []);
    await getSubjects();
    expect(mock.history.get[0].url).toBe("/timetable/subjects/");
  });

  it("getPeriods calls GET /timetable/periods/", async () => {
    mock.onGet("/timetable/periods/").reply(200, []);
    await getPeriods();
    expect(mock.history.get[0].url).toBe("/timetable/periods/");
  });
});
