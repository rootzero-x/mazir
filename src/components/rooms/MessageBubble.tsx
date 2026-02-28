import { Check, CheckCheck, Clock, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message } from "@/lib/types";
import { getFullImageUrl } from "@/lib/normalization";

interface MessageBubbleProps {
    message: Message;
    isMine: boolean;
    previousMessageSameSender: boolean;
    onRetry?: (msgId: string) => void;
}

import { formatTimeSafe } from "@/lib/dateUtils";

interface MessageBubbleProps {
    message: Message;
    isMine: boolean;
    previousMessageSameSender: boolean;
    onRetry?: (msgId: string) => void;
}

export default function MessageBubble({ message, isMine, previousMessageSameSender, onRetry }: MessageBubbleProps) {
    // 1. Format Time Utility
    const time = formatTimeSafe(message.created_at || (message as any).createdAt, "absolute");

    // 2. Strict Username Logic (No "Unknown" fallback)
    // We trust the backend to provide 'username'
    const username = message.username || message.sender?.username || "User";
    const avatarLetter = (username?.[0] || "?").toUpperCase();

    return (
        <div
            className={cn(
                "flex w-full items-end gap-2.5",
                // ALIGNMENT: Mine = Right, Others = Left
                isMine ? "justify-end" : "justify-start",
                previousMessageSameSender ? "mt-0.5" : "mt-3"
            )}
        >
            {/* AVATAR (Left, Others only) */}
            {!isMine && !previousMessageSameSender && (
                <div className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-[12px] font-bold text-white select-none overflow-hidden relative group-hover:shadow-[0_0_10px_rgba(139,92,246,0.3)] transition-shadow">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-sky-500 rounded-full" />
                    <div className="absolute inset-[1.5px] bg-slate-900 rounded-full flex items-center justify-center overflow-hidden">
                        {((message.sender as any)?.avatar_url || message.sender?.avatarUrl || (message as any).user?.avatar_url || (message as any).avatar_url) ? (
                            <img
                                src={getFullImageUrl(((message.sender as any)?.avatar_url || message.sender?.avatarUrl || (message as any).user?.avatar_url || (message as any).avatar_url)) || ''}
                                alt={username}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            avatarLetter
                        )}
                    </div>
                </div>
            )}

            {/* Spacer for alignment when same sender (Others) */}
            {!isMine && previousMessageSameSender && (
                <div className="w-8 shrink-0" />
            )}

            <div className={cn("flex flex-col max-w-[85%] md:max-w-[70%]", isMine ? "items-end" : "items-start")}>

                {/* USERNAME LABEL (Others only, first message in sequence) 
                    Smaller text, slightly dim, no duplication.
                */}
                {!isMine && !previousMessageSameSender && username && (
                    <span className="ml-1 mb-1 text-[11px] font-bold text-violet-300 drop-shadow-[0_0_3px_rgba(139,92,246,0.3)] select-none tracking-wide">
                        {username}
                    </span>
                )}

                <div className="relative group">
                    {/* BUBBLE */}
                    <div
                        className={cn(
                            "relative break-words px-3.5 py-2.5 text-[15px] transition-all duration-300",
                            isMine
                                ? "bg-violet-600 shadow-[0_4px_15px_rgba(139,92,246,0.25)] text-white border border-violet-500/50 rounded-2xl rounded-tr-sm bubble-mine" // Neon Violet
                                : "bg-slate-900/60 backdrop-blur-md shadow-[0_4px_15px_rgba(0,0,0,0.1)] text-slate-100 border border-white/5 rounded-2xl rounded-tl-sm bubble-other", // Premium Glass

                            // Corner rounding for sequences
                            isMine && previousMessageSameSender && "rounded-tr-2xl",
                            !isMine && previousMessageSameSender && "rounded-tl-2xl",

                            // Failed state
                            message.status === "failed" && "border-red-500/50 bg-red-900/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                        )}
                    >
                        <p className="leading-relaxed whitespace-pre-wrap font-light">{message.content}</p>

                        {/* TIME & STATUS (Bottom Right Float) */}
                        <div className={cn(
                            "float-right ml-4 mt-2 mb-[-2px] flex items-center gap-1.5 text-[10px] select-none font-medium",
                            isMine ? "text-violet-200/80" : "text-slate-400/80"
                        )}>
                            <span>{time}</span>
                            {isMine && (
                                <span>
                                    {message.status === "sending" && <Clock className="h-3 w-3 animate-pulse text-violet-300" />}
                                    {message.status === "failed" && <RefreshCw className="h-3 w-3 text-red-400 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]" />}
                                    {message.status === "sent" && <Check className="h-3 w-3" />}
                                    {message.status === "read" && <CheckCheck className="h-3 w-3 text-sky-300 drop-shadow-[0_0_5px_rgba(56,189,248,0.4)]" />}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* RETRY BUTTON */}
                    {message.status === "failed" && onRetry && (
                        <button
                            onClick={() => onRetry(String(message.id))}
                            className="absolute -left-10 top-1/2 -translate-y-1/2 p-2 text-red-400 hover:text-red-300 bg-red-500/10 rounded-full hover:bg-red-500/20 transition-all shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                            title="Retry"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
