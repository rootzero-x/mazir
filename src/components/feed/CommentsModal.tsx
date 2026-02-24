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
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
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
                            <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-6 text-left align-middle shadow-xl transition-all flex flex-col max-h-[80vh]">
                                <div className="flex items-center justify-between mb-4 shrink-0">
                                    <Dialog.Title as="h3" className="text-lg font-bold text-white">
                                        Comments
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Comments List */}
                                <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin scrollbar-thumb-slate-800">
                                    {loading ? (
                                        <div className="flex justify-center py-8">
                                            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                                        </div>
                                    ) : comments.length > 0 ? (
                                        comments.map((comment, index) => {
                                            const author = getSafeUser(comment.author || (comment as any).user);
                                            // Fallback key generation if ID is missing (should verify why ID is missing though)
                                            const key = comment.id ? String(comment.id) : `comment-${index}-${new Date().getTime()}`;
                                            return (
                                                <div key={key} className="flex gap-3 items-start p-3 rounded-xl bg-slate-950/50 border border-slate-800/50">
                                                    <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                                                        {author.avatarUrl ? (
                                                            <img src={author.avatarUrl} alt={author.username} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <span className="text-xs font-bold text-slate-400">{author.username?.[0]?.toUpperCase()}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-baseline justify-between">
                                                            <span className="font-semibold text-sm text-white truncate">{author.displayName}</span>
                                                            <span className="text-xs text-slate-500 shrink-0 ml-2">
                                                                {formatTimeSafe(comment.createdAt)}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-slate-300 mt-0.5 whitespace-pre-wrap">{comment.content}</p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-10 text-slate-500">
                                            No comments yet. Be the first!
                                        </div>
                                    )}
                                </div>

                                {/* Input Area */}
                                <div className="shrink-0 flex items-end gap-2 bg-slate-900 pt-2 border-t border-slate-800/50">
                                    <div className="relative flex-1">
                                        <textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Write a comment..."
                                            rows={1}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none min-h-[44px] max-h-32"
                                            style={{ height: 'auto', minHeight: '44px' }}
                                        />
                                    </div>
                                    <button
                                        onClick={handleSend}
                                        disabled={!newComment.trim() || sending}
                                        className={`p-3 rounded-xl transition-colors ${newComment.trim() && !sending
                                            ? "bg-blue-600 text-white hover:bg-blue-500"
                                            : "bg-slate-800 text-slate-500 cursor-not-allowed"
                                            }`}
                                    >
                                        {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
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
