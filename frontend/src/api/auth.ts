import apiClient from "./client";
import type { User, AuthTokens } from "@/types";

export const login = (email: string, password: string) =>
  apiClient.post<AuthTokens>("/auth/login/", { email, password });

export const logout = (refresh: string) => apiClient.post("/auth/logout/", { refresh });

export const getMe = () => apiClient.get<User>("/accounts/me/");

export const getSocialAuthUrl = (provider: "google" | "facebook" | "github") =>
  `/api/auth/social/${provider}/`;
