import apiClient from "./client";
import type { Material, PaginatedResponse } from "@/types";

export const getMaterials = (params?: Record<string, string | number>) =>
  apiClient.get<PaginatedResponse<Material>>("/materials/", { params });

export const getMaterial = (id: number) => apiClient.get<Material>(`/materials/${id}/`);

export const uploadMaterial = (data: FormData) =>
  apiClient.post<Material>("/materials/", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteMaterial = (id: number) => apiClient.delete(`/materials/${id}/`);

export const addComment = (materialId: number, content: string) =>
  apiClient.post(`/materials/${materialId}/comments/`, { content });
