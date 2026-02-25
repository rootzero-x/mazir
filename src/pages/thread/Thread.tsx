import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, MessageSquare, Share2, ArrowLeft, Send, Loader2 } from "lucide-react";
import api from "@/lib/api";
import type { Post } from "@/lib/types";
import toast from "react-hot-toast";
import { getSafeUser, getSafePost, getSafeComment } from "@/lib/normalization";
import { helpfulStorage } from "@/lib/helpfulStorage";
import PostTypeBadge from "@/components/feed/PostTypeBadge";
import { formatTimeSafe } from "@/lib/dateUtils";

export default function Thread() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newComment, setNewComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handlePostComment();
        }
    };

    // Loading skeleton
    if (loading) {
        return (
            <div className="h-[calc(100vh-4rem)] flex flex-col p-4 md:p-6 animate-pulse">
                <div className="h-6 w-24 bg-slate-800 rounded mb-6" />
                <div className="flex-1 space-y-6">
                    <div className="h-96 rounded-2xl bg-slate-900 border border-slate-800" />
                    <div className="h-32 rounded-xl bg-slate-900" />
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="h-[calc(100vh-4rem)] flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <h2 className="text-2xl font-bold text-white mb-2">Failed to Load Thread</h2>
                    <p className="text-slate-400 mb-6">{error}</p>
                    <div className="flex gap-3 justify-center">
                        <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
                            Try Again
                        </Button>
                        <Button onClick={() => navigate("/feed")} variant="outline">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Feed
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Not found
    if (!post) {
        return (
            <div className="h-[calc(100vh-4rem)] flex items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-slate-300 mb-4">Thread not found</h2>
                    <Button onClick={() => navigate("/feed")} variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Feed
                    </Button>
                </div>
            </div>
        );
    }

    const author = getSafeUser(post.author);

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col">
            {/* Header */}
            <div className="flex-shrink-0 px-4 md:px-6 py-4 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 pt-[calc(env(safe-area-inset-top,0px)+1rem)]">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => navigate("/feed")}
                        className="inline-flex items-center text-sm text-slate-500 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Feed
                    </button>
                    <Button
                        onClick={handleShare}
                        variant="outline"
                        size="sm"
                        className="border-slate-700 hover:bg-slate-800"
                    >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                    </Button>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-6">
                    {/* Post Card */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm p-6 md:p-8 space-y-6">
                        {/* Author Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white overflow-hidden ring-2 ring-slate-700">
                                    {author.avatarUrl ? (
                                        <img src={author.avatarUrl} alt={author.username} className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-lg">{author.username[0]?.toUpperCase()}</span>
                                    )}
                                </div>
                                <div>
                                    <div className="font-semibold text-white">{author.displayName}</div>
                                    <div className="text-xs text-slate-400">
                                        {formatTimeSafe(post.createdAt)}
                                    </div>
                                </div>
                            </div>
                            <PostTypeBadge type={post.type as any} />
                        </div>

                        {/* Title */}
                        {post.title && (
                            <h1 className="text-3xl font-bold leading-tight text-white">{post.title}</h1>
                        )}

                        {/* Content Sections */}
                        <div className="space-y-4">
                            {post.context && (
                                <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Context</h3>
                                    <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{post.context}</p>
                                </div>
                            )}

                            {(post.problem || post.attempt) && (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {post.problem && (
                                        <div className="p-4 rounded-xl bg-red-950/10 border border-red-500/20">
                                            <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-2">Problem</h3>
                                            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{post.problem}</p>
                                        </div>
                                    )}
                                    {post.attempt && (
                                        <div className="p-4 rounded-xl bg-yellow-950/10 border border-yellow-500/20">
                                            <h3 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider mb-2">Attempt</h3>
                                            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{post.attempt}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {post.solution && (
                                <div className="p-4 rounded-xl bg-green-950/10 border border-green-500/20">
                                    <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-2">Solution</h3>
                                    <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{post.solution}</p>
                                </div>
                            )}

                            {post.result && (
                                <div className="p-4 rounded-xl bg-blue-950/10 border border-blue-500/20">
                                    <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-2">Result</h3>
                                    <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{post.result}</p>
                                </div>
                            )}

                            {!post.context && !post.problem && !post.solution && post.content && (
                                <p className="text-lg text-slate-300 whitespace-pre-wrap leading-relaxed">
                                    {post.content}
                                </p>
                            )}
                        </div>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {post.tags.map((tag, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-xs text-slate-400"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Interaction Bar */}
                        <div className="flex items-center gap-4 pt-4 border-t border-slate-800">
                            <button
                                onClick={handleHelpful}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${liked
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white"
                                    }`}
                            >
                                <ThumbsUp className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
                                <span className="text-sm font-medium">{likeCount}</span>
                            </button>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 text-slate-400">
                                <MessageSquare className="h-4 w-4" />
                                <span className="text-sm font-medium">{comments.length}</span>
                            </div>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white">
                            Comments ({comments.length})
                        </h2>

                        {comments.length > 0 ? (
                            <div className="space-y-3">
                                {comments.map((comment) => {
                                    const commentAuthor = getSafeUser(comment.author);
                                    return (
                                        <div
                                            key={comment.id}
                                            className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors"
                                        >
                                            <div className="flex gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center font-bold text-white text-sm overflow-hidden flex-shrink-0">
                                                    {commentAuthor.avatarUrl ? (
                                                        <img src={commentAuthor.avatarUrl} alt={commentAuthor.username} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <span>{commentAuthor.username[0]?.toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-semibold text-white text-sm">
                                                            {commentAuthor.displayName}
                                                        </span>
                                                        <span className="text-xs text-slate-500">
                                                            {formatTimeSafe(comment.createdAt)}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                                                        {comment.content}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-500">
                                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>No comments yet. Be the first to comment!</p>
                            </div>
                        )}
                    </div>

                    {/* Bottom spacing for sticky input */}
                    <div className="h-32" />
                </div>
            </div>

            {/* Sticky Comment Input */}
            <div className="flex-shrink-0 border-t border-slate-800 bg-slate-950/95 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto px-4 md:px-6 py-4">
                    <div className="flex gap-3">
                        <Textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Write a comment... (Enter to submit, Shift+Enter for new line)"
                            className="flex-1 min-h-[44px] max-h-32 resize-none bg-slate-900 border-slate-700 focus:border-blue-500 text-white placeholder:text-slate-500"
                            disabled={submitting}
                        />
                        <Button
                            onClick={handlePostComment}
                            disabled={!newComment.trim() || submitting}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgb(51 65 85);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgb(71 85 105);
                }
            `}</style>
        </div>
    );
}
