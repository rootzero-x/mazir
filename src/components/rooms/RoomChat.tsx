import { useEffect, useRef, useState, useCallback } from "react";
import { Send, MoreVertical, Phone, Video, ArrowLeft, Loader2 } from "lucide-react";
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
    const scrollRef = useRef<HTMLDivElement>(null);
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

    // Scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
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
        <div className="flex flex-col bg-slate-950 h-[100dvh] md:h-full">
            {/* Header */}
            <div className="flex z-20 h-[calc(4.5rem+env(safe-area-inset-top,0px))] shrink-0 items-end pb-4 border-b border-slate-800/50 bg-slate-950/80 px-4 backdrop-blur-md sticky top-0">
                <div className="flex items-center gap-3">
                    <Link
                        to="/rooms"
                        className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 hover:bg-slate-800 hover:text-white md:hidden"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>

                    <button
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20 cursor-pointer"
                        onClick={onToggleInfo}
                    >
                        {room?.icon ? <span className="text-xl">{room.icon}</span> : (room?.name?.[0]?.toUpperCase() || "#")}
                    </button>

                    <div className="flex flex-col cursor-pointer" onClick={onToggleInfo}>
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-bold text-white leading-tight">
                                {room?.name || "Room"}
                            </h2>
                        </div>
                        <span className="text-xs text-slate-400">
                            {room?.memberCount || 0} members
                            {room?.onlineCount ? ` • ${room.onlineCount} online` : ""}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button className="hidden h-10 w-10 items-center justify-center rounded-full text-slate-400 hover:bg-slate-800 hover:text-white sm:flex">
                        <Phone className="h-5 w-5" />
                    </button>
                    <button className="hidden h-10 w-10 items-center justify-center rounded-full text-slate-400 hover:bg-slate-800 hover:text-white sm:flex">
                        <Video className="h-5 w-5" />
                    </button>
                    <button
                        onClick={onToggleInfo}
                        className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 hover:bg-slate-800 hover:text-white"
                    >
                        <MoreVertical className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                {loading && messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center space-y-4 text-center text-slate-500">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 ring-1 ring-slate-800">
                            <span className="text-4xl">👋</span>
                        </div>
                        <p>No messages yet.<br />Be the first to say hello!</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-1 pb-4">
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
                        <div ref={scrollRef} />
                    </div>
                )}
            </div>

            {/* Composer */}
            <div className="shrink-0 p-4 pt-2 bg-slate-950">
                <div className="relative flex items-end gap-2 rounded-2xl bg-slate-900/50 p-2 ring-1 ring-slate-800 focus-within:ring-blue-500/50 transition-all">
                    <TextareaAutosize
                        ref={textareaRef}
                        minRows={1}
                        maxRows={5}
                        placeholder="Write a message..."
                        className="flex-1 resize-none bg-transparent px-3 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none scrollbar-none"
                        value={inputValue}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || sending}
                        className={cn(
                            "mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all",
                            inputValue.trim()
                                ? "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20"
                                : "bg-slate-800 text-slate-500 cursor-not-allowed"
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
