import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { getChannels, getMessages } from "@/api/chat";
import { useAuthStore } from "@/store/auth";
import { Send, Hash, Plus, Users } from "lucide-react";
import { format } from "date-fns";
import type { Message } from "@/types";

export default function ChatPage() {
  const { channelId } = useParams<{ channelId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [input, setInput] = useState("");
  const [wsMessages, setWsMessages] = useState<Message[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: channels } = useQuery({
    queryKey: ["channels"],
    queryFn: () => getChannels().then((r) => r.data),
  });

  const activeChannelId = channelId ? parseInt(channelId) : channels?.[0]?.id;

  const { data: messages } = useQuery({
    queryKey: ["messages", activeChannelId],
    queryFn: () => (activeChannelId ? getMessages(activeChannelId).then((r) => r.data) : []),
    enabled: !!activeChannelId,
  });

  // WebSocket connection
  useEffect(() => {
    if (!activeChannelId) return;
    setWsMessages([]);

    const wsUrl = `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/ws/chat/${activeChannelId}/`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "message") {
        setWsMessages((prev) => [
          ...prev,
          {
            id: data.id,
            channel: activeChannelId,
            author: data.author_id,
            author_name: data.author_name,
            content: data.content,
            attachment: null,
            reply_to: data.reply_to,
            created_at: data.created_at,
            is_deleted: false,
            reaction_count: 0,
          },
        ]);
      }
    };

    return () => ws.close();
  }, [activeChannelId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, wsMessages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !wsRef.current) return;
    wsRef.current.send(JSON.stringify({ type: "message", content: input }));
    setInput("");
  };

  const allMessages = [...(messages ?? []), ...wsMessages];
  const activeChannel = channels?.find((c) => c.id === activeChannelId);

  return (
    <div className="flex h-full -m-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Channel list */}
      <div className="w-60 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-sm">Channels</h2>
          <button className="text-gray-400 hover:text-gray-600">
            <Plus size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {channels?.map((ch) => (
            <button
              key={ch.id}
              onClick={() => navigate(`/chat/${ch.id}`)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${
                ch.id === activeChannelId ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"
              }`}
            >
              {ch.channel_type === "direct" ? (
                <Users size={14} className="flex-shrink-0" />
              ) : (
                <Hash size={14} className="flex-shrink-0" />
              )}
              <span className="truncate">{ch.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Message area */}
      <div className="flex-1 flex flex-col">
        {activeChannel ? (
          <>
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold flex items-center gap-2">
                <Hash size={16} />
                {activeChannel.name}
              </h3>
              {activeChannel.description && (
                <p className="text-xs text-gray-500 mt-0.5">{activeChannel.description}</p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {allMessages.map((msg) => (
                <div
                  key={`${msg.id}-${msg.created_at}`}
                  className={`flex gap-3 ${msg.author === user?.id ? "flex-row-reverse" : ""}`}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                    {msg.author_name?.charAt(0) ?? "?"}
                  </div>
                  <div
                    className={`max-w-xs lg:max-w-md ${msg.author === user?.id ? "items-end" : "items-start"} flex flex-col`}
                  >
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-700">{msg.author_name}</span>
                      <span className="text-xs text-gray-400">
                        {format(new Date(msg.created_at), "HH:mm")}
                      </span>
                    </div>
                    <div
                      className={`px-3 py-2 rounded-2xl text-sm ${
                        msg.author === user?.id
                          ? "bg-blue-600 text-white rounded-tr-sm"
                          : "bg-gray-100 text-gray-900 rounded-tl-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Message #${activeChannel.name}`}
                className="input flex-1"
              />
              <button type="submit" disabled={!input.trim()} className="btn-primary px-3">
                <Send size={16} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a channel to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
