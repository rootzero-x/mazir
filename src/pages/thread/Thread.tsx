import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageSquare, Share2, ArrowLeft, Send, Loader2 } from "lucide-react";
import api from "@/lib/api";
import type { Post } from "@/lib/types";
import toast from "react-hot-toast";
import { getSafeUser, getSafePost, getSafeComment } from "@/lib/normalization";
import { helpfulStorage } from "@/lib/helpfulStorage";
import PostTypeBadge from "@/components/feed/PostTypeBadge";
import { formatTimeSafe } from "@/lib/dateUtils";
import TextareaAutosize from "react-textarea-autosize";
import { cn } from "@/lib/utils";

export default function Thread() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newComment, setNewComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Helpful state
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;

            setLoading(true);
            setError(null);

            try {
                // Parallel fetch for post and comments
                const [postRes, commentsRes] = await Promise.all([
                    api.get<any>(`/posts/${id}`),
                    api.get<any>(`/posts/${id}/comments`)
                ]);

                console.log("[Thread] Raw post response:", postRes.data);
                console.log("[Thread] Raw comments response:", commentsRes.data);

                // Parse post with safe normalization
                const rawPost = postRes.data.post || postRes.data.data?.post || postRes.data.data || postRes.data;
                const normalizedPost = rawPost ? getSafePost(rawPost) : null;

                if (normalizedPost) {
                    setPost(normalizedPost);

                    // Initialize helpful state from localStorage
                    const storedLiked = helpfulStorage.isHelpful(id);
                    setLiked(storedLiked || normalizedPost.isHelpfulByMe || false);
                    setLikeCount(normalizedPost.helpfulCount || 0);
                }

                // Parse comments with safe normalization
                const commentsData = commentsRes.data;
                let loadedComments: any[] = [];

                if (Array.isArray(commentsData)) {
                    loadedComments = commentsData;
                } else if (Array.isArray(commentsData.comments)) {
                    loadedComments = commentsData.comments;
                } else if (Array.isArray(commentsData.data)) {
                    loadedComments = commentsData.data;
                } else if (Array.isArray(commentsData.data?.comments)) {
                    loadedComments = commentsData.data.comments;
                }

                // Normalize all comments
                const normalizedComments = loadedComments.map(c => getSafeComment(c));
                setComments(normalizedComments);

                console.log("[Thread] Loaded:", {
                    post: normalizedPost?.title,
                    comments: normalizedComments.length
                });
            } catch (err: any) {
                console.error("[Thread] Failed to load:", err);
                setError(err.response?.data?.message || "Failed to load thread");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleHelpful = async () => {
        if (!id) return;

        const previousLiked = liked;
        const previousCount = likeCount;

        // Optimistic update
        const newLiked = !liked;
        setLiked(newLiked);
        setLikeCount(prev => newLiked ? prev + 1 : Math.max(0, prev - 1));
        helpfulStorage.toggle(id);

        try {
            const { data } = await api.post(`/posts/${id}/helpful`);

            // Use backend response for accurate state
            const responseData = data.post || data.data || data;
            if (responseData) {
                const backendLiked = responseData.viewer_has_helpful ?? responseData.viewerHasHelpful ?? newLiked;
                const backendCount = responseData.helpful_count ?? responseData.helpfulCount ?? likeCount;

                setLiked(backendLiked);
                setLikeCount(backendCount);

                // Sync storage
                if (backendLiked) {
                    helpfulStorage.add(id);
                } else {
                    helpfulStorage.remove(id);
                }
            }
        } catch (err) {
            console.error("[Thread] Failed to toggle helpful:", err);
            // Revert on error
            setLiked(previousLiked);
            setLikeCount(previousCount);
            helpfulStorage.toggle(id);
            toast.error("Failed to update helpful");
        }
    };

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            toast.success("Link copied to clipboard!");
        }).catch(() => {
            toast.error("Failed to copy link");
        });
    };

    const handlePostComment = async () => {
        if (!newComment.trim() || !id) return;

        setSubmitting(true);

        try {
            const { data } = await api.post(`/posts/${id}/comments`, { content: newComment });

            console.log("[Thread] Comment response:", data);

            // Parse created comment
            const createdComment = getSafeComment(data.comment || data.data?.comment || data.data || data);

            // Add to comments list
            setComments(prev => [createdComment, ...prev]);
            setNewComment("");
            toast.success("Comment posted!");
        } catch (err: any) {
            console.error("[Thread] Failed to post comment:", err);
            toast.error(err.response?.data?.message || "Failed to post comment");
        } finally {
            setSubmitting(false);
        }
    };

    // Loading skeleton
    if (loading) {
        return (
            <div className="h-full flex flex-col p-4 md:p-8 animate-pulse bg-transparent max-w-4xl mx-auto w-full">
                <div className="h-6 w-32 bg-slate-800/80 rounded-md mb-8" />
                <div className="rounded-2xl border border-white/5 bg-slate-900/30 p-6 md:p-8 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-slate-800/80" />
                        <div className="space-y-2">
                            <div className="h-4 w-32 bg-slate-800/80 rounded" />
                            <div className="h-3 w-20 bg-slate-800/50 rounded" />
                        </div>
                    </div>
                    <div className="h-8 w-3/4 bg-slate-800/80 rounded-lg" />
                    <div className="space-y-3">
                        <div className="h-4 w-full bg-slate-800/50 rounded" />
                        <div className="h-4 w-full bg-slate-800/50 rounded" />
                        <div className="h-4 w-4/5 bg-slate-800/50 rounded" />
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="h-full flex items-center justify-center p-4 bg-transparent relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-rose-500/5 pointer-events-none" />
                <div className="text-center max-w-md w-full glass-card p-10 relative z-10 flex flex-col items-center">
                    <div className="h-20 w-20 rounded-[2rem] bg-red-950/30 backdrop-blur-md border border-red-500/20 flex items-center justify-center shadow-[inset_0_0_20px_rgba(239,68,68,0.1)] mb-6">
                        <span className="text-4xl drop-shadow-lg filter">⚠️</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Failed to Load</h2>
                    <p className="text-slate-400 font-light mb-8">{error}</p>
                    <div className="flex gap-3 justify-center w-full">
                        <Button onClick={() => window.location.reload()} className="bg-violet-600 hover:bg-violet-500 flex-1 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                            Try Again
                        </Button>
                        <Button onClick={() => navigate("/feed")} variant="outline" className="flex-1 border-white/10 bg-slate-900/50 hover:bg-white/5 text-slate-300">
                            Home
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Not found
    if (!post) {
        return (
            <div className="h-full flex items-center justify-center p-4 bg-transparent relative overflow-hidden">
                <div className="text-center max-w-sm w-full glass-card p-10 relative z-10 flex flex-col items-center">
                    <div className="h-20 w-20 rounded-[2rem] bg-slate-900/50 backdrop-blur-md border border-white/5 flex items-center justify-center shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] mb-6 opacity-80 border-dashed">
                        <span className="text-4xl drop-shadow-lg filter grayscale opacity-80">👻</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-200 tracking-tight mb-6">Thread not found</h2>
                    <Button onClick={() => navigate("/feed")} variant="outline" className="w-full border-white/10 bg-slate-900/50 hover:bg-white/5 text-slate-300 transition-all">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Feed
                    </Button>
                </div>
            </div>
        );
    }

    const author = getSafeUser(post.author);

    return (
        <div className="flex flex-col h-full w-full bg-transparent relative overflow-hidden">
            {/* Ambient inner glow for the thread pane */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-sky-500/5 pointer-events-none z-0" />

            {/* Header */}
            <div className="flex-shrink-0 px-4 md:px-6 py-4 border-b border-white/5 bg-transparent backdrop-blur-2xl sticky top-0 z-30 pt-[calc(env(safe-area-inset-top,0px)+1rem)] shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => navigate("/feed")}
                        className="inline-flex items-center text-[15px] font-medium text-slate-400 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Back to Feed
                    </button>
                    <Button
                        onClick={handleShare}
                        variant="outline"
                        size="sm"
                        className="border-white/10 bg-slate-900/50 hover:bg-white/5 hover:text-white hover:border-white/20 transition-all text-slate-300"
                    >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                    </Button>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
                <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-6">
                    {/* Post Card */}
                    <div className="rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-md p-6 md:p-8 space-y-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                        {/* Author Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="relative group/avatar cursor-pointer">
                                    <div className="absolute -inset-0.5 bg-gradient-to-br from-violet-600 to-sky-500 rounded-full opacity-60 group-hover/avatar:opacity-100 group-hover/avatar:blur-sm transition-all duration-300"></div>
                                    <div className="relative h-12 w-12 rounded-full bg-slate-950 flex items-center justify-center font-bold text-white overflow-hidden ring-2 ring-slate-900">
                                        {author.avatarUrl ? (
                                            <img src={author.avatarUrl} alt={author.username} className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="text-lg">{author.username[0]?.toUpperCase()}</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <div className="font-bold text-white tracking-tight">{author.displayName}</div>
                                    <div className="text-xs text-slate-400 font-medium">
                                        {formatTimeSafe(post.createdAt)}
                                    </div>
                                </div>
                            </div>
                            <PostTypeBadge type={post.type as any} />
                        </div>

                        {/* Title */}
                        {post.title && (
                            <h1 className="text-3xl font-bold leading-tight text-white tracking-tight neon-text-glow drop-shadow-sm">{post.title}</h1>
                        )}

                        {/* Content Sections */}
                        <div className="space-y-4">
                            {post.context && (
                                <div className="p-5 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-white/5 shadow-inner">
                                    <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Context
                                    </h3>
                                    <p className="text-slate-300 whitespace-pre-wrap leading-relaxed font-light text-[15px]">{post.context}</p>
                                </div>
                            )}

                            {(post.problem || post.attempt) && (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {post.problem && (
                                        <div className="p-5 rounded-2xl bg-red-500/5 backdrop-blur-sm border border-red-500/20 shadow-[inset_0_0_20px_rgba(239,68,68,0.05)]">
                                            <h3 className="text-[12px] font-bold text-red-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> Problem
                                            </h3>
                                            <p className="text-slate-200 whitespace-pre-wrap leading-relaxed font-light text-[15px]">{post.problem}</p>
                                        </div>
                                    )}
                                    {post.attempt && (
                                        <div className="p-5 rounded-2xl bg-amber-500/5 backdrop-blur-sm border border-amber-500/20 shadow-[inset_0_0_20px_rgba(245,158,11,0.05)]">
                                            <h3 className="text-[12px] font-bold text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Attempt
                                            </h3>
                                            <p className="text-slate-200 whitespace-pre-wrap leading-relaxed font-light text-[15px]">{post.attempt}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {post.solution && (
                                <div className="p-5 rounded-2xl bg-emerald-500/5 backdrop-blur-sm border border-emerald-500/20 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]">
                                    <h3 className="text-[12px] font-bold text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Solution
                                    </h3>
                                    <p className="text-slate-200 whitespace-pre-wrap leading-relaxed font-light text-[15px]">{post.solution}</p>
                                </div>
                            )}

                            {post.result && (
                                <div className="p-5 rounded-2xl bg-sky-500/5 backdrop-blur-sm border border-sky-500/20 shadow-[inset_0_0_20px_rgba(14,165,233,0.05)]">
                                    <h3 className="text-[12px] font-bold text-sky-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span> Result
                                    </h3>
                                    <p className="text-slate-200 whitespace-pre-wrap leading-relaxed font-light text-[15px]">{post.result}</p>
                                </div>
                            )}

                            {!post.context && !post.problem && !post.solution && post.content && (
                                <p className="text-[15px] text-slate-300 whitespace-pre-wrap leading-relaxed font-light">
                                    {post.content}
                                </p>
                            )}
                        </div>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {post.tags.map((tag, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-[12px] font-medium text-violet-300 drop-shadow-[0_0_5px_rgba(139,92,246,0.3)] shadow-inner transition-colors hover:bg-violet-500/20 cursor-default"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Interaction Bar */}
                        <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                            <button
                                onClick={handleHelpful}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-medium ${liked
                                    ? "bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] ring-1 ring-violet-500/50"
                                    : "bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white ring-1 ring-transparent hover:ring-white/5"
                                    }`}
                            >
                                <ThumbsUp className={`h-4 w-4 ${liked ? "fill-current drop-shadow-md" : ""}`} />
                                <span className="text-[14px]">Helpful {likeCount > 0 ? `(${likeCount})` : ""}</span>
                            </button>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/30 text-slate-400 ring-1 ring-white/5 font-medium cursor-default">
                                <MessageSquare className="h-4 w-4" />
                                <span className="text-[14px]">{comments.length} Comments</span>
                            </div>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                            Discussions <span className="text-violet-400 text-sm bg-violet-500/10 px-2 py-0.5 rounded-full">{comments.length}</span>
                        </h2>

                        {comments.length > 0 ? (
                            <div className="space-y-3">
                                {comments.map((comment) => {
                                    const commentAuthor = getSafeUser(comment.author);
                                    return (
                                        <div
                                            key={comment.id}
                                            className="p-5 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/5 hover:border-white/10 transition-all shadow-sm"
                                        >
                                            <div className="flex gap-4">
                                                <div className="h-10 w-10 shrink-0 rounded-full ring-2 ring-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.15)] bg-slate-900 flex items-center justify-center text-white font-bold text-[13px] overflow-hidden">
                                                    {commentAuthor.avatarUrl ? (
                                                        <img src={commentAuthor.avatarUrl} alt={commentAuthor.username} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <span>{commentAuthor.username[0]?.toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1.5">
                                                        <span className="font-bold text-white text-[15px] tracking-tight hover:text-violet-300 transition-colors cursor-pointer">
                                                            {commentAuthor.displayName}
                                                        </span>
                                                        <span className="text-[12px] font-medium text-slate-500">
                                                            {formatTimeSafe(comment.createdAt)}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-300 text-[15px] font-light whitespace-pre-wrap leading-relaxed">
                                                        {comment.content}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-16 flex flex-col items-center justify-center">
                                <div className="h-20 w-20 rounded-[2rem] bg-slate-900/50 backdrop-blur-md border border-white/5 flex items-center justify-center shadow-[inset_0_0_20px_rgba(139,92,246,0.1)] mb-4 isolate">
                                    <span className="text-4xl drop-shadow-lg filter relative z-10">💬</span>
                                    <div className="absolute inset-0 bg-violet-500/10 rounded-[2rem] blur-xl z-0" />
                                </div>
                                <p className="text-slate-400 font-light text-lg">No comments yet.</p>
                                <p className="text-slate-500 font-light text-sm mt-1">Be the first to share your thoughts!</p>
                            </div>
                        )}
                    </div>

                    {/* Bottom spacing for sticky input */}
                    <div className="h-24" />
                </div>
            </div>

            {/* Sticky Comment Input */}
            <div className="flex-shrink-0 bg-slate-950/40 backdrop-blur-2xl border-t border-white/5 p-4 z-20 relative shadow-[0_-4px_30px_rgba(0,0,0,0.1)] pt-[calc(1rem)] pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
                <div className="max-w-4xl mx-auto">
                    <div className="relative flex items-end gap-2 rounded-2xl bg-slate-900/60 backdrop-blur-xl p-2 ring-1 ring-white/5 focus-within:ring-violet-500/50 focus-within:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all duration-300">
                        <TextareaAutosize
                            ref={textareaRef}
                            minRows={1}
                            maxRows={6}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handlePostComment();
                                }
                            }}
                            placeholder="Add to the discussion..."
                            className="flex-1 resize-none bg-transparent px-3 py-3 text-[15px] text-white placeholder:text-slate-500 focus:outline-none scrollbar-none"
                            disabled={submitting}
                        />
                        <button
                            onClick={handlePostComment}
                            disabled={!newComment.trim() || submitting}
                            className={cn(
                                "mb-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
                                newComment.trim() && !submitting
                                    ? "bg-violet-600 text-white hover:bg-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] border border-violet-500/50"
                                    : "bg-slate-800/80 text-slate-500 border border-transparent cursor-not-allowed"
                            )}
                        >
                            {submitting ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Send className="h-5 w-5 ml-0.5" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
