import apiClient, { unwrapList, type PaginatedOrList } from "./client";
import type { TimetableEntry, Subject, Period } from "@/types";

export const getMyTimetable = (): Promise<TimetableEntry[]> =>
  apiClient.get<PaginatedOrList<TimetableEntry>>("/timetable/my/").then((r) => unwrapList(r.data));

export const getTimetableEntries = (
  params?: Record<string, string | number>
): Promise<TimetableEntry[]> =>
  apiClient
    .get<PaginatedOrList<TimetableEntry>>("/timetable/entries/", { params })
    .then((r) => unwrapList(r.data));

export const getSubjects = (): Promise<Subject[]> =>
  apiClient.get<PaginatedOrList<Subject>>("/timetable/subjects/").then((r) => unwrapList(r.data));

export const getPeriods = (): Promise<Period[]> =>
  apiClient.get<PaginatedOrList<Period>>("/timetable/periods/").then((r) => unwrapList(r.data));
