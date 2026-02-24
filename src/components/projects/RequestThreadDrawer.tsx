import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { X, Send, Loader2, CheckCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { ProjectRequest, ProjectRequestMessage } from "@/lib/types";
import { toast } from "react-hot-toast";

interface RequestThreadDrawerProps {
    request: ProjectRequest | null;
    onClose: () => void;
    isOpen: boolean;
}

export default function RequestThreadDrawer({ request, onClose, isOpen }: RequestThreadDrawerProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ProjectRequestMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch messages when drawer opens or request changes
    useEffect(() => {
        if (!isOpen || !request) return;

        const fetchMessages = async () => {
            setLoading(true);
            try {
                console.log(`[RequestThreadDrawer] Fetching thread for request ${request.id}`);
                const { data } = await api.get(`/requests/${request.id}`);
                // Backend should return { request: {...}, messages: [...] }
                const thread = data.messages || data.data?.messages || (Array.isArray(data) ? data : []);
                console.log(`[RequestThreadDrawer] Received ${thread.length} messages`, thread);
                setMessages(thread);
            } catch (error: any) {
                console.error("[RequestThreadDrawer] Failed to fetch messages:", error);
                if (error.response?.status === 403) {
                    toast.error("You don't have access to this conversation");
                    onClose();
                } else {
                    toast.error("Failed to load conversation");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();

        // Polling for real-time updates
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [isOpen, request?.id]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !request || sending) return;

        const content = newMessage.trim();
        setNewMessage(""); // Optimistic clear
        setSending(true);

        // Optimistic UI update
        const tempId = `temp-${Date.now()}`;
        const optimisticMessage: any = {
            id: tempId,
            request_id: request.id,
            content,
            sender: {
                id: user!.id,
                username: user!.username || "You",
                avatarUrl: user!.avatarUrl,
                displayName: user!.displayName
            },
            created_at: new Date().toISOString(),
            is_read: false
        };

        setMessages(prev => [...prev, optimisticMessage]);

        try {
            const { data } = await api.post(`/requests/${request.id}/messages`, { content });
            // Replace optimistic message with real one
            const realMessage = data.message || data;
            setMessages(prev => prev.map(m => m.id === tempId ? realMessage : m));
        } catch (error) {
            console.error("Failed to send message:", error);
            toast.error("Failed to send message");
            // Rollback
            setMessages(prev => prev.filter(m => m.id !== tempId));
            setNewMessage(content); // Restore content
        } finally {
            setSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="relative w-full max-w-md h-full bg-slate-950 border-l border-slate-800 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-800 overflow-hidden ring-2 ring-slate-800">
                            {/* Display the OTHER person's avatar */}
                            {request?.sender.id === user?.id ? (
                                // If I am sender, show Owner (would need project owner info passed down, strictly speaking. 
                                // For now, we show request sender if I am owner, or "Owner" if I am sender. 
                                // Simplified: Always show the other party if possible, fallback to request sender for now)
                                <div className="h-full w-full flex items-center justify-center bg-blue-600 text-white font-bold">
                                    {request?.project?.owner?.username?.[0] || "P"}
                                </div>
                            ) : (
                                <img
                                    src={request?.sender.avatarUrl || `https://ui-avatars.com/api/?name=${request?.sender.username}&background=0D8ABC&color=fff`}
                                    alt="Sender"
                                    className="h-full w-full object-cover"
                                />
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-white leading-tight">
                                {request?.type === "OFFER" ? "Purchase Offer" : request?.type === "COLLAB" ? "Collaboration Request" : "Question"}
                            </h3>
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                                <Lock className="h-3 w-3" /> Private Conversation
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-800">
                        <X className="h-5 w-5 text-slate-400" />
                    </Button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/50">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        </div>
                    ) : (
                        <>
                            {/* Original Request Message */}
                            {request && (
                                <div className="flex justify-center mb-6">
                                    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 max-w-[90%] text-center text-sm text-slate-300 shadow-sm">
                                        <p className="font-medium text-blue-400 mb-1">Original Request:</p>
                                        "{request.message}"
                                    </div>
                                </div>
                            )}

                            {messages.map((msg: any) => {
                                const isMe = msg.sender?.id === user?.id || msg.sender_id === user?.id;
                                const senderUsername = msg.sender?.username || msg.username || "User";
                                const messageTime = msg.created_at ? formatDistanceToNow(new Date(msg.created_at), { addSuffix: true }) : "—";

                                return (
                                    <div
                                        key={msg.id}
                                        className={cn(
                                            "flex w-full mb-4 animate-in slide-in-from-bottom-2",
                                            isMe ? "justify-end" : "justify-start"
                                        )}
                                    >
                                        <div className={cn(
                                            "max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-md",
                                            isMe
                                                ? "bg-blue-600 text-white rounded-tr-none"
                                                : "bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700"
                                        )}>
                                            {!isMe && (
                                                <p className="text-xs text-slate-400 mb-1 font-medium">@{senderUsername}</p>
                                            )}
                                            <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                            <div className={cn(
                                                "flex items-center justify-end gap-1 mt-1 text-[10px]",
                                                isMe ? "text-blue-200" : "text-slate-400"
                                            )}>
                                                <span>{messageTime}</span>
                                                {isMe && <CheckCheck className="h-3 w-3 opacity-70" />}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-slate-900 border-t border-slate-800">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your reply..."
                            className="bg-slate-950 border-slate-800 focus:border-blue-500 rounded-xl"
                            disabled={sending}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={!newMessage.trim() || sending}
                            className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white shrink-0"
                        >
                            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
