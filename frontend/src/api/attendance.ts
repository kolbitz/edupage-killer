import apiClient from "./client";
import type { AttendanceRecord, PaginatedResponse } from "@/types";

export const getMyAttendance = () => apiClient.get<AttendanceRecord[]>("/attendance/my/");

export const getAttendance = (params?: Record<string, string>) =>
  apiClient.get<PaginatedResponse<AttendanceRecord>>("/attendance/", { params });

export const recordAttendance = (data: Partial<AttendanceRecord>) =>
  apiClient.post<AttendanceRecord>("/attendance/", data);
