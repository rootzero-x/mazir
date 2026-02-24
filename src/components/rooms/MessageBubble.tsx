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
                "flex w-full items-end gap-2",
                // ALIGNMENT: Mine = Right, Others = Left
                isMine ? "justify-end" : "justify-start",
                previousMessageSameSender ? "mt-0.5" : "mt-2"
            )}
        >
            {/* AVATAR (Left, Others only) */}
            {!isMine && !previousMessageSameSender && (
                <div className="h-8 w-8 shrink-0 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 select-none border border-slate-700 overflow-hidden">
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
                    <span className="ml-1 mb-0.5 text-[11px] font-bold text-blue-400/90 select-none">
                        {username}
                    </span>
                )}

                <div className="relative group">
                    {/* BUBBLE */}
                    <div
                        className={cn(
                            "relative break-words px-3 py-2 text-sm shadow-sm border",
                            isMine
                                ? "bg-blue-600 text-white border-blue-600/50 rounded-2xl rounded-tr-sm bubble-mine" // Darker/Distinct
                                : "bg-slate-800 text-slate-100 border-slate-700/80 rounded-2xl rounded-tl-sm bubble-other", // Normal

                            // Corner rounding for sequences
                            isMine && previousMessageSameSender && "rounded-tr-2xl",
                            !isMine && previousMessageSameSender && "rounded-tl-2xl",

                            // Failed state
                            message.status === "failed" && "border-red-500/50 bg-red-900/20"
                        )}
                    >
                        <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>

                        {/* TIME & STATUS (Bottom Right Float) */}
                        <div className={cn(
                            "float-right ml-3 mt-1 flex items-center gap-1 text-[10px] select-none",
                            isMine ? "text-white/70" : "text-slate-400/70"
                        )}>
                            <span>{time}</span>
                            {isMine && (
                                <span>
                                    {message.status === "sending" && <Clock className="h-3 w-3 animate-pulse" />}
                                    {message.status === "failed" && <RefreshCw className="h-3 w-3 text-red-400" />}
                                    {message.status === "sent" && <Check className="h-3 w-3" />}
                                    {message.status === "read" && <CheckCheck className="h-3 w-3 text-blue-200" />}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* RETRY BUTTON */}
                    {message.status === "failed" && onRetry && (
                        <button
                            onClick={() => onRetry(String(message.id))}
                            className="absolute -left-8 top-1/2 -translate-y-1/2 p-1 text-red-500 hover:text-red-400"
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
