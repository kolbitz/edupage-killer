import apiClient from "./client";
import type { TimetableEntry, Subject, Period } from "@/types";

export const getMyTimetable = () => apiClient.get<TimetableEntry[]>("/timetable/my/");

export const getTimetableEntries = (params?: Record<string, string | number>) =>
  apiClient.get<TimetableEntry[]>("/timetable/entries/", { params });

export const getSubjects = () => apiClient.get<Subject[]>("/timetable/subjects/");

export const getPeriods = () => apiClient.get<Period[]>("/timetable/periods/");
