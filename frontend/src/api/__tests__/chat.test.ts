import MockAdapter from "axios-mock-adapter";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import apiClient from "../client";
import { getChannels, createChannel, getMessages, sendMessage } from "../chat";

describe("chat api", () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.restore();
  });

  it("getChannels calls GET /chat/channels/", async () => {
    mock.onGet("/chat/channels/").reply(200, []);
    const res = await getChannels();
    expect(res.data).toEqual([]);
  });

  it("createChannel posts body to /chat/channels/", async () => {
    const payload = { name: "general", channel_type: "group" as const };
    mock.onPost("/chat/channels/").reply(201, { id: 1, ...payload });
    await createChannel(payload);
    expect(JSON.parse(mock.history.post[0].data)).toMatchObject(payload);
  });

  it("getMessages calls GET /chat/channels/:id/messages/", async () => {
    mock.onGet("/chat/channels/3/messages/").reply(200, []);
    await getMessages(3);
    expect(mock.history.get[0].url).toBe("/chat/channels/3/messages/");
  });

  it("sendMessage includes reply_to when replyTo is provided", async () => {
    mock.onPost("/chat/channels/1/messages/").reply(201, { id: 10 });
    await sendMessage(1, "Hello!", 5);
    expect(JSON.parse(mock.history.post[0].data)).toEqual({ content: "Hello!", reply_to: 5 });
  });

  it("sendMessage omits reply_to when replyTo is not provided", async () => {
    mock.onPost("/chat/channels/1/messages/").reply(201, { id: 11 });
    await sendMessage(1, "World");
    const body = JSON.parse(mock.history.post[0].data);
    expect(body.content).toBe("World");
    expect(body).not.toHaveProperty("reply_to");
  });
});
