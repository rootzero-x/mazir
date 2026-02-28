import { useEffect, useRef, useState, useCallback } from "react";
import { Send, MoreVertical, Phone, Video, ArrowLeft, Loader2, Users } from "lucide-react";
import { Link } from "react-router-dom";
import TextareaAutosize from "react-textarea-autosize";
import { toast } from "react-hot-toast";

import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { Room, Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import MessageBubble from "./MessageBubble";

interface RoomChatProps {
    room: Room;
    onToggleInfo: () => void;
}

export default function RoomChat({ room, onToggleInfo }: RoomChatProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Fetch Messages
    const fetchMessages = useCallback(async () => {
        if (!room.slug) return;
        try {
            const res = await api.get(`/rooms/${room.slug}/messages?limit=50`);
            const data = res.data;

            let msgs: Message[] = [];
            if (Array.isArray(data)) {
                msgs = data;
            } else if (data?.messages && Array.isArray(data.messages)) {
                msgs = data.messages;
            } else if (data?.data && Array.isArray(data.data)) {
                msgs = data.data;
            } else if (data?.data?.messages && Array.isArray(data.data.messages)) {
                msgs = data.data.messages;
            }

            // Deduplicate by ID
            const uniqueMsgs = Array.from(new Map(msgs.map(m => [m.id, m])).values());

            // Sort by created_at (oldest first)
            const sorted = uniqueMsgs.sort((a, b) => {
                const dateA = new Date(a.created_at || (a as any).createdAt).getTime();
                const dateB = new Date(b.created_at || (b as any).createdAt).getTime();
                return dateA - dateB;
            });

            // Final check for duplicates before setting state
            setMessages(() => {
                // Combine with existing optimistic messages that might not be in the fetch yet (if any)
                // Actually, fetch replaces all, so we just use sorted.
                return sorted;
            });
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        } finally {
            setLoading(false);
        }
    }, [room.slug]);

    // Cleanup input when switching rooms
    useEffect(() => {
        setMessages([]);
        setLoading(true);
        fetchMessages();
        setInputValue("");

        // Auto-refresh messages every 3s (polling fallback for non-socket)
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [room.slug, fetchMessages]);

    // Scroll to bottom on new messages (Container specific to fix global push)
    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages, loading]);

    // Send Message
    const handleSendMessage = async () => {
        const content = inputValue.trim();
        if (!content || !user || sending) return;

        const tempId = `temp-${Date.now()}`;

        // Optimistic Update
        const optimisticMsg: Message = {
            id: tempId,
            content,
            user_id: user.id,
            username: user.username,
            created_at: new Date().toISOString(),
            status: "sending"
        };

        setMessages((prev) => [...prev, optimisticMsg]);
        setInputValue("");
        setSending(true);

        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }

        try {
            // Strict JSON payload: { content: "..." }
            const { data } = await api.post(`/rooms/${room.slug}/messages`, { content });

            // Success: Replace temp message with real one
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === tempId ? { ...data, status: "sent" } : msg
                )
            );
        } catch (error) {
            console.error("Send failed:", error);
            // Failure: Mark as failed
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === tempId ? { ...msg, status: "failed" } : msg
                )
            );
            toast.error("Failed to send message");
        } finally {
            setSending(false);
        }
    };

    const handleRetry = async (msgId: string) => {
        const msgToRetry = messages.find(m => String(m.id) === msgId);
        if (!msgToRetry) return;

        // update to sending
        setMessages((prev) =>
            prev.map((m) => (String(m.id) === msgId ? { ...m, status: "sending" } : m))
        );

        try {
            const { data } = await api.post(`/rooms/${room.slug}/messages`, { content: msgToRetry.content });
            setMessages((prev) =>
                prev.map((msg) =>
                    String(msg.id) === msgId ? { ...data, status: "sent" } : msg
                )
            );
        } catch (error) {
            setMessages((prev) =>
                prev.map((m) => (String(m.id) === msgId ? { ...m, status: "failed" } : m))
            );
            toast.error("Retry failed");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="flex flex-col bg-transparent h-full md:h-full relative overflow-hidden w-full min-h-0 md:min-h-0">
            {/* Ambient inner glow for the chat pane */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-sky-500/5 pointer-events-none z-0" />

            {/* Header */}
            <div className="flex-none flex z-20 h-20 items-center border-b border-white/5 bg-[#020617]/70 px-4 sm:px-6 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] relative w-full pt-[calc(env(safe-area-inset-top,0px))]">
                <div className="flex items-center gap-3 w-full">
                    <Link
                        to="/rooms"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-white/5 hover:text-white md:hidden transition-all"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>

                    <button
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-sky-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] ring-1 ring-white/10 cursor-pointer hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all"
                        onClick={onToggleInfo}
                    >
                        {room?.icon ? <span className="text-xl drop-shadow-md">{room.icon}</span> : <span className="text-lg font-bold">{room?.name?.[0]?.toUpperCase() || "#"}</span>}
                    </button>

                    <div className="flex flex-col cursor-pointer group" onClick={onToggleInfo}>
                        <div className="flex items-center gap-2">
                            <h2 className="text-[15px] font-bold text-white leading-tight tracking-tight group-hover:text-violet-200 transition-colors">
                                {room?.name || "Room"}
                            </h2>
                        </div>
                        <span className="text-[12px] font-light text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <Users className="h-3 w-3" /> {room?.memberCount || 0}
                            {room?.onlineCount ? (
                                <>
                                    <span className="text-slate-600">•</span>
                                    <span className="flex items-center gap-1 text-sky-400 font-medium bg-sky-500/10 px-1.5 rounded-full ring-1 ring-sky-500/20 shadow-[0_0_5px_rgba(56,189,248,0.2)]">
                                        <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
                                        {room.onlineCount}
                                    </span>
                                </>
                            ) : ""}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-1 ml-auto">
                    <button className="hidden h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-white/5 hover:text-white sm:flex transition-all">
                        <Phone className="h-5 w-5" />
                    </button>
                    <button className="hidden h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-white/5 hover:text-white sm:flex transition-all">
                        <Video className="h-5 w-5" />
                    </button>
                    <button
                        onClick={onToggleInfo}
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all"
                    >
                        <MoreVertical className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-violet-500/20 scrollbar-track-transparent relative z-10 w-full overflow-x-hidden"
            >
                {loading && messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                        <div className="relative flex justify-center items-center">
                            <div className="absolute inset-0 rounded-full blur-xl bg-violet-500/20 animate-pulse" />
                            <Loader2 className="h-8 w-8 animate-spin text-violet-400 relative z-10" />
                        </div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center space-y-6 text-center">
                        <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-slate-900/50 backdrop-blur-md border border-white/5 shadow-[inset_0_0_20px_rgba(139,92,246,0.1)] group hover:scale-105 transition-transform duration-500">
                            <span className="text-5xl drop-shadow-lg filter">👋</span>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-white tracking-tight">No messages yet</h3>
                            <p className="text-slate-400 font-light max-w-xs leading-relaxed">Say hello to the community and start the conversation!</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-1.5 pb-2">
                        {messages.map((msg, index) => {
                            // 1. Strict isMine check using user_id
                            const isMine = String(msg.user_id) === String(user?.id);

                            const prevMsg = messages[index - 1];
                            const isSameSender = prevMsg && (
                                String(prevMsg.user_id) === String(msg.user_id)
                            );

                            return (
                                <MessageBubble
                                    key={msg.id}
                                    message={msg}
                                    isMine={isMine}
                                    previousMessageSameSender={!!isSameSender}
                                    onRetry={handleRetry}
                                />
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Composer */}
            <div className="shrink-0 p-4 pt-2 bg-transparent relative z-20">
                <div className="relative flex items-end gap-2 rounded-2xl bg-slate-900/60 backdrop-blur-xl p-2 ring-1 ring-white/5 focus-within:ring-violet-500/50 focus-within:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all duration-300">
                    <TextareaAutosize
                        ref={textareaRef}
                        minRows={1}
                        maxRows={5}
                        placeholder="Write a message..."
                        className="flex-1 resize-none bg-transparent px-3 py-3 text-[15px] text-white placeholder:text-slate-500 focus:outline-none scrollbar-none"
                        value={inputValue}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || sending}
                        className={cn(
                            "mb-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
                            inputValue.trim()
                                ? "bg-violet-600 text-white hover:bg-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] border border-violet-500/50"
                                : "bg-slate-800/80 text-slate-500 border border-transparent cursor-not-allowed"
                        )}
                    >
                        {sending ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Send className="h-5 w-5" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
