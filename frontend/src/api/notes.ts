import apiClient, { unwrapList, type PaginatedOrList } from "./client";
import type { Note } from "@/types";

export const getNotes = (params?: Record<string, string>): Promise<Note[]> =>
  apiClient.get<PaginatedOrList<Note>>("/notes/", { params }).then((r) => unwrapList(r.data));

export const getNote = (id: number) => apiClient.get<Note>(`/notes/${id}/`);

export const createNote = (data: Partial<Note>) => apiClient.post<Note>("/notes/", data);

export const updateNote = (id: number, data: Partial<Note>) =>
  apiClient.patch<Note>(`/notes/${id}/`, data);

export const deleteNote = (id: number) => apiClient.delete(`/notes/${id}/`);
