import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Loader2, Send } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/api";
import { getSafeUser } from "@/lib/normalization";
import { formatTimeSafe } from "@/lib/dateUtils";
import type { Post, Comment } from "@/lib/types";

interface CommentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: Post;
    onCommentAdded?: (comment: Comment) => void;
}

export default function CommentsModal({ isOpen, onClose, post, onCommentAdded }: CommentsModalProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState("");
    const [sending, setSending] = useState(false);

    // Fetch comments when modal opens
    useEffect(() => {
        if (isOpen && post.id) {
            setLoading(true);
            api.get<{ comments: Comment[] }>(`/posts/${post.id}/comments`)
                .then(res => {
                    const data = res.data as any;
                    console.log("[CommentsModal] Raw response:", data);

                    let loadedComments: any[] = [];

                    if (Array.isArray(data)) {
                        loadedComments = data;
                    } else if (data?.comments && Array.isArray(data.comments)) {
                        loadedComments = data.comments;
                    } else if (data?.data) {
                        // Handle data.data wrapper
                        if (Array.isArray(data.data)) {
                            loadedComments = data.data;
                        } else if (data.data.comments && Array.isArray(data.data.comments)) {
                            loadedComments = data.data.comments;
                        }
                    }

                    console.log("[CommentsModal] Parsed comments:", loadedComments.length);

                    // CRITICAL: Use getSafeComment for normalization
                    const normalizedComments = loadedComments.map(c => {
                        const normalized = {
                            id: c.id || c._id || `temp-${Date.now()}-${Math.random()}`,
                            content: c.content || c.text || c.body || "",
                            author: c.author || c.user || c.commenter,
                            createdAt: c.createdAt || c.created_at || c.timestamp || new Date().toISOString(),
                            likes: c.likes || c.likes_count || 0
                        };
                        return normalized;
                    });

                    setComments(normalizedComments as Comment[]);
                })
                .catch(err => {
                    console.error("Failed to load comments:", err);
                })
                .finally(() => setLoading(false));
        } else if (!isOpen) {
            // Reset state on close
            setComments([]);
            setNewComment("");
        }
    }, [isOpen, post.id]);

    const handleSend = async () => {
        if (!newComment.trim()) return;

        setSending(true);
        try {
            const { data } = await api.post(`/posts/${post.id}/comments`, { content: newComment });
            console.log("[CommentsModal] Created comment response:", data);

            // API might return { comment: ... } or just the comment or { data: ... }
            const rawComment = data.comment || data.data?.comment || data.data || data;

            // CRITICAL: Normalize the created comment
            const createdComment = {
                id: rawComment.id || rawComment._id || `temp-${Date.now()}`,
                content: rawComment.content || rawComment.text || rawComment.body || newComment,
                author: rawComment.author || rawComment.user || rawComment.commenter,
                createdAt: rawComment.createdAt || rawComment.created_at || new Date().toISOString(),
                likes: rawComment.likes || 0
            };

            setComments(prev => [createdComment as Comment, ...prev]);
            setNewComment("");
            if (onCommentAdded) onCommentAdded(createdComment as Comment);
            toast.success("Comment added!");
        } catch (error) {
            console.error("Failed to post comment:", error);
            toast.error("Failed to post comment.");
        } finally {
            setSending(false);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" aria-hidden="true" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-[2.5rem] bg-slate-900/40 backdrop-blur-2xl border border-white/5 p-6 md:p-8 text-left align-middle shadow-[0_8px_32px_rgba(0,0,0,0.4)] ring-1 ring-white/5 transition-all flex flex-col max-h-[85vh] relative z-10">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 blur-[80px] rounded-full pointer-events-none" />
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-sky-500/10 blur-[60px] rounded-full pointer-events-none" />

                                <div className="flex items-center justify-between mb-6 shrink-0 relative z-10 border-b border-white/5 pb-4">
                                    <Dialog.Title as="h3" className="text-2xl font-bold text-white tracking-tight drop-shadow-sm">
                                        Comments <span className="text-violet-400 text-sm ml-2 bg-violet-500/10 px-2 py-0.5 rounded-full">{comments.length}</span>
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="h-8 w-8 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all ring-offset-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Comments List */}
                                <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin scrollbar-thumb-violet-500/20 scrollbar-track-transparent relative z-10">
                                    {loading ? (
                                        <div className="flex justify-center py-12">
                                            <Loader2 className="h-8 w-8 animate-spin text-violet-500 drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                                        </div>
                                    ) : comments.length > 0 ? (
                                        comments.map((comment, index) => {
                                            const author = getSafeUser(comment.author || (comment as any).user);
                                            // Fallback key generation if ID is missing (should verify why ID is missing though)
                                            const key = comment.id ? String(comment.id) : `comment-${index}-${new Date().getTime()}`;
                                            return (
                                                <div key={key} className="flex gap-4 items-start p-4 rounded-3xl bg-slate-950/40 border border-white/5 hover:border-white/10 transition-colors shadow-inner group">
                                                    <div className="h-10 w-10 shrink-0 rounded-full ring-1 ring-white/10 shadow-[inner_0_0_10px_rgba(255,255,255,0.05)] bg-slate-900 flex items-center justify-center text-white font-bold text-[13px] overflow-hidden group-hover:ring-violet-500/30 transition-all">
                                                        {author.avatarUrl ? (
                                                            <img src={author.avatarUrl} alt={author.username} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <span>{author.username?.[0]?.toUpperCase()}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1 cursor-pointer">
                                                            <span className="font-bold text-white text-[15px] tracking-tight hover:text-violet-300 transition-colors truncate">{author.displayName}</span>
                                                            <span className="text-[12px] font-medium text-slate-500 shrink-0">
                                                                {formatTimeSafe(comment.createdAt)}
                                                            </span>
                                                        </div>
                                                        <p className="text-[15px] text-slate-300 whitespace-pre-wrap leading-relaxed font-light">{comment.content}</p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-12 flex flex-col items-center justify-center">
                                            <div className="h-16 w-16 mb-4 rounded-2xl bg-slate-900/50 flex items-center justify-center border border-white/5 shadow-inner">
                                                <span className="text-2xl drop-shadow-md">💬</span>
                                            </div>
                                            <p className="text-slate-400 font-medium">No comments yet</p>
                                            <p className="text-sm text-slate-500 mt-1">Be the first to share your thoughts!</p>
                                        </div>
                                    )}
                                </div>

                                {/* Input Area */}
                                <div className="shrink-0 flex items-end gap-3 pt-4 border-t border-white/5 relative z-10">
                                    <div className="relative flex-1 rounded-2xl bg-slate-950/50 backdrop-blur-md p-1.5 ring-1 ring-white/5 focus-within:ring-violet-500/50 focus-within:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all duration-300">
                                        <textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Write your comment..."
                                            rows={1}
                                            className="w-full bg-transparent border-0 px-3 py-2.5 text-[15px] text-white placeholder:text-slate-500 focus:outline-none focus:ring-0 resize-none min-h-[44px] max-h-32 scrollbar-none"
                                            style={{ height: 'auto', minHeight: '44px' }}
                                        />
                                    </div>
                                    <button
                                        onClick={handleSend}
                                        disabled={!newComment.trim() || sending}
                                        className={`mb-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 ${newComment.trim() && !sending
                                            ? "bg-violet-600 text-white hover:bg-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] border border-violet-500/50"
                                            : "bg-slate-800/80 text-slate-500 border border-transparent cursor-not-allowed"
                                            }`}
                                    >
                                        {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 ml-0.5" />}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
