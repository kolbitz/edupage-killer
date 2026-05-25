import apiClient from "./client";
import type { Assignment, Submission, Grade } from "@/types";

export const getAssignments = (params?: Record<string, string | number>) =>
  apiClient.get<Assignment[]>("/assignments/", { params });

export const getAssignment = (id: number) => apiClient.get<Assignment>(`/assignments/${id}/`);

export const createAssignment = (data: Partial<Assignment>) =>
  apiClient.post<Assignment>("/assignments/", data);

export const getSubmissions = (assignmentId: number) =>
  apiClient.get<Submission[]>(`/assignments/${assignmentId}/submissions/`);

export const submitAssignment = (assignmentId: number, data: FormData) =>
  apiClient.post<Submission>(`/assignments/${assignmentId}/submissions/`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getGrades = (params?: Record<string, string>) =>
  apiClient.get<Grade[]>("/assignments/grades/", { params });
