import apiClient, { unwrapList, type PaginatedOrList } from "./client";
import type { AttendanceRecord } from "@/types";

export const getMyAttendance = (): Promise<AttendanceRecord[]> =>
  apiClient
    .get<PaginatedOrList<AttendanceRecord>>("/attendance/my/")
    .then((r) => unwrapList(r.data));

export const getAttendance = (params?: Record<string, string>): Promise<AttendanceRecord[]> =>
  apiClient
    .get<PaginatedOrList<AttendanceRecord>>("/attendance/", { params })
    .then((r) => unwrapList(r.data));

export const recordAttendance = (data: Partial<AttendanceRecord>) =>
  apiClient.post<AttendanceRecord>("/attendance/", data);
