import { useState, useRef, useEffect } from "react";
import { Send, Smile, Paperclip, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
    onSend: (text: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export function ChatInput({ onSend, placeholder = "Message...", disabled }: ChatInputProps) {
    const [text, setText] = useState("");
    const [isSending, setIsSending] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!text.trim() || disabled || isSending) return;

        setIsSending(true);
        // Simulate a tiny delay for "premium feel" or just direct call is fine, 
        // usually parent handles the async, but we can reset here immediately for optimistic UI
        onSend(text);
        setText("");
        setIsSending(false);

        // Reset height
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    // Auto-resize
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
        }
    }, [text]);

    return (
        <div className="border-t border-white/5 bg-[#070A12]/80 p-4 backdrop-blur-md">
            <div className="relative mx-auto flex max-w-4xl items-end gap-2 rounded-3xl border border-white/10 bg-[#0B1220] p-1.5 shadow-2xl shadow-black/50 transition-colors focus-within:border-blue-500/30 focus-within:ring-1 focus-within:ring-blue-500/20">

                {/* Attach Button (Visual Only) */}
                <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 rounded-full text-slate-400 hover:bg-white/5 hover:text-white" disabled>
                    <Paperclip className="h-5 w-5" />
                </Button>

                <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    rows={1}
                    disabled={disabled}
                    className="max-h-[120px] min-h-[40px] w-full resize-none bg-transparent py-2.5 text-[15px] text-slate-100 placeholder:text-slate-500 focus:outline-none custom-scrollbar"
                    style={{ lineHeight: '1.5' }}
                />

                <div className="flex shrink-0 gap-1 pb-0.5">
                    {/* Emoji (Visual Only) */}
                    <Button variant="ghost" size="icon" className="hidden sm:flex h-9 w-9 rounded-full text-slate-400 hover:bg-white/5 hover:text-blue-400 transition-colors" disabled>
                        <Smile className="h-5 w-5" />
                    </Button>

                    <Button
                        onClick={() => handleSubmit()}
                        disabled={!text.trim() || disabled}
                        size="icon"
                        className={`h-9 w-9 rounded-full transition-all duration-200 
                            ${text.trim() ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20" : "bg-slate-800 text-slate-500"}
                        `}
                    >
                        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 ml-0.5" />}
                    </Button>
                </div>
            </div>

            <div className="mt-2 text-center text-[10px] text-slate-600 hidden sm:block">
                Press <strong>Enter</strong> to send, <strong>Shift+Enter</strong> for new line
            </div>
        </div>
    );
}
