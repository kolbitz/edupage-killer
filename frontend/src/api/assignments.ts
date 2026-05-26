import apiClient, { unwrapList, type PaginatedOrList } from "./client";
import type { Assignment, Submission, Grade } from "@/types";

export const getAssignments = (params?: Record<string, string | number>): Promise<Assignment[]> =>
  apiClient
    .get<PaginatedOrList<Assignment>>("/assignments/", { params })
    .then((r) => unwrapList(r.data));

export const getAssignment = (id: number) => apiClient.get<Assignment>(`/assignments/${id}/`);

export const createAssignment = (data: Partial<Assignment>) =>
  apiClient.post<Assignment>("/assignments/", data);

export const getSubmissions = (assignmentId: number): Promise<Submission[]> =>
  apiClient
    .get<PaginatedOrList<Submission>>(`/assignments/${assignmentId}/submissions/`)
    .then((r) => unwrapList(r.data));

export const submitAssignment = (assignmentId: number, data: FormData) =>
  apiClient.post<Submission>(`/assignments/${assignmentId}/submissions/`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getGrades = (params?: Record<string, string>): Promise<Grade[]> =>
  apiClient
    .get<PaginatedOrList<Grade>>("/assignments/grades/", { params })
    .then((r) => unwrapList(r.data));
