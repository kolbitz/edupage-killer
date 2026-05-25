import apiClient from "./client";
import type { Channel, Message } from "@/types";

export const getChannels = () => apiClient.get<Channel[]>("/chat/channels/");

export const createChannel = (data: Partial<Channel>) =>
  apiClient.post<Channel>("/chat/channels/", data);

export const getMessages = (channelId: number) =>
  apiClient.get<Message[]>(`/chat/channels/${channelId}/messages/`);

export const sendMessage = (channelId: number, content: string, replyTo?: number) =>
  apiClient.post<Message>(`/chat/channels/${channelId}/messages/`, {
    content,
    reply_to: replyTo,
  });
