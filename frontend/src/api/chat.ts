import apiClient, { unwrapList, type PaginatedOrList } from "./client";
import type { Channel, Message } from "@/types";

export const getChannels = (): Promise<Channel[]> =>
  apiClient.get<PaginatedOrList<Channel>>("/chat/channels/").then((r) => unwrapList(r.data));

export const createChannel = (data: Partial<Channel>) =>
  apiClient.post<Channel>("/chat/channels/", data);

export const getMessages = (channelId: number): Promise<Message[]> =>
  apiClient
    .get<PaginatedOrList<Message>>(`/chat/channels/${channelId}/messages/`)
    .then((r) => unwrapList(r.data));

export const sendMessage = (channelId: number, content: string, replyTo?: number) =>
  apiClient.post<Message>(`/chat/channels/${channelId}/messages/`, {
    content,
    reply_to: replyTo,
  });
