import MockAdapter from "axios-mock-adapter";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import apiClient from "../client";
import { login, logout, getMe, getSocialAuthUrl } from "../auth";

describe("auth api", () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.restore();
  });

  describe("login", () => {
    it("posts email and password to /auth/login/", async () => {
      const tokens = { access: "acc123", refresh: "ref456" };
      mock.onPost("/auth/login/").reply(200, tokens);
      const res = await login("user@school.edu", "secret");
      expect(res.data).toEqual(tokens);
      expect(JSON.parse(mock.history.post[0].data)).toEqual({
        email: "user@school.edu",
        password: "secret",
      });
    });
  });

  describe("logout", () => {
    it("posts refresh token to /auth/logout/", async () => {
      mock.onPost("/auth/logout/").reply(204);
      await logout("ref456");
      expect(JSON.parse(mock.history.post[0].data)).toEqual({ refresh: "ref456" });
    });
  });

  describe("getMe", () => {
    it("calls GET /accounts/me/", async () => {
      const user = { id: 1, email: "a@b.com", full_name: "A", role: "student", avatar: null };
      mock.onGet("/accounts/me/").reply(200, user);
      const res = await getMe();
      expect(res.data).toEqual(user);
    });
  });

  describe("getSocialAuthUrl", () => {
    it("returns the correct URL for google", () => {
      expect(getSocialAuthUrl("google")).toBe("/api/auth/social/google/");
    });

    it("returns the correct URL for github", () => {
      expect(getSocialAuthUrl("github")).toBe("/api/auth/social/github/");
    });

    it("returns the correct URL for facebook", () => {
      expect(getSocialAuthUrl("facebook")).toBe("/api/auth/social/facebook/");
    });
  });
});
