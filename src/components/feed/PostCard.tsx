import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ThumbsUp, MessageSquare, Share2, ExternalLink } from "lucide-react";
import type { Post } from "@/lib/types";
import { formatTimeSafe } from "@/lib/dateUtils";
import { getSafeUser } from "@/lib/normalization";
import CommentsModal from "./CommentsModal";
import PostTypeBadge from "./PostTypeBadge";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { helpfulStorage } from "@/lib/helpfulStorage";

interface PostCardProps {
    post: Post;
    onUpdate?: (updates: Partial<Post>) => void;
}

export default function PostCard({ post, onUpdate }: PostCardProps) {
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const [helpfulCount, setHelpfulCount] = useState(post.helpfulCount || 0);
    const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
    const [liked, setLiked] = useState(() => {
        const storedLiked = helpfulStorage.isHelpful(post.id);
        return storedLiked || post.isHelpfulByMe || false;
    });

    const timeAgo = formatTimeSafe(post.createdAt);
    const author = getSafeUser(post.author);

    // Sync state when post prop updates
    useEffect(() => {
        const storedLiked = helpfulStorage.isHelpful(post.id);
        if (storedLiked !== liked) {
            setLiked(storedLiked);
        }
        setHelpfulCount(typeof post.helpfulCount === 'number' ? post.helpfulCount : 0);
        setCommentsCount(typeof post.commentsCount === 'number' ? post.commentsCount : 0);
    }, [post.id, post.helpfulCount, post.commentsCount, liked]);

    const handleHelpful = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const previousLiked = liked;
        const previousCount = helpfulCount;
        const newLiked = !liked;
        const newCount = newLiked ? helpfulCount + 1 : Math.max(0, helpfulCount - 1);

        helpfulStorage.toggle(post.id);
        setLiked(newLiked);
        setHelpfulCount(newCount);

        try {
            const { data } = await api.post(`/posts/${post.id}/helpful`);

            console.log('[PostCard] Helpful response:', data);

            // CRITICAL: Use backend response for accurate state
            const responseData = data.post || data.data || data;

            if (responseData) {
                // Map viewer_has_helpful and helpful_count from backend
                const backendLiked = responseData.viewer_has_helpful ?? responseData.viewerHasHelpful ?? newLiked;
                const backendCount = responseData.helpful_count ?? responseData.helpfulCount ?? newCount;

                console.log('[PostCard] Backend state:', { backendLiked, backendCount });

                // Update state with backend truth
                setLiked(backendLiked);
                setHelpfulCount(backendCount);

                // Sync storage with backend
                if (backendLiked) {
                    helpfulStorage.add(post.id);
                } else {
                    helpfulStorage.remove(post.id);
                }

                // CRITICAL: Update Feed state via callback
                onUpdate?.({
                    isHelpfulByMe: backendLiked,
                    helpfulCount: backendCount
                });
            }
        } catch (error: any) {
            console.error("Failed to toggle helpful:", error);
            setLiked(previousLiked);
            setHelpfulCount(previousCount);
            helpfulStorage.toggle(post.id);

            if (error.response?.status === 404) {
                toast("Helpful feature coming soon!", { icon: "🚧" });
            } else {
                toast.error("Failed to update status");
            }
        }
    };

    const handleShare = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const url = `${window.location.origin}/thread/${post.id}`;
        navigator.clipboard.writeText(url).then(() => {
            toast.success("Link copied to clipboard");
        }).catch(() => {
            toast.error("Failed to copy link");
        });
    };

    const handleCommentClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsCommentsOpen(true);
    };

    // Generate type-specific preview
    const renderPreview = () => {
        const type = post.type?.toUpperCase();

        switch (type) {
            case "BUG":
                return (
                    <div className="space-y-2">
                        {post.problem && (
                            <div className="text-sm">
                                <span className="font-semibold text-red-400">Problem:</span>
                                <span className="text-slate-400 ml-2 line-clamp-2">{post.problem}</span>
                            </div>
                        )}
                        {post.solution && (
                            <div className="text-sm">
                                <span className="font-semibold text-green-400">Solution:</span>
                                <span className="text-slate-400 ml-2 line-clamp-2">{post.solution}</span>
                            </div>
                        )}
                    </div>
                );

            case "SOLUTION":
                return (
                    <div className="space-y-2">
                        {post.problem && (
                            <div className="text-sm">
                                <span className="font-semibold text-slate-300">Solves:</span>
                                <span className="text-slate-400 ml-2 line-clamp-2">{post.problem}</span>
                            </div>
                        )}
                        {post.solution && (
                            <p className="text-slate-400 text-sm line-clamp-3">{post.solution}</p>
                        )}
                    </div>
                );

            case "INSIGHT":
                return (
                    <p className="text-slate-400 text-sm line-clamp-3">
                        {post.result || post.content || "Check out this insight..."}
                    </p>
                );

            case "PROJECT_UPDATE":
            case "UPDATE":
                return (
                    <div className="space-y-2">
                        {post.context && (
                            <p className="text-slate-400 text-sm line-clamp-2">
                                <span className="font-semibold text-purple-400">Changed:</span> {post.context}
                            </p>
                        )}
                        {post.result && (
                            <p className="text-slate-400 text-sm line-clamp-2">{post.result}</p>
                        )}
                    </div>
                );

            default:
                return (
                    <p className="text-slate-400 text-sm line-clamp-3">
                        {post.content || post.context || "Check out this post..."}
                    </p>
                );
        }
    };

    return (
        <>
            <div className="group relative rounded-2xl border border-slate-800 bg-slate-950/50 p-6 transition-all hover:border-blue-500/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.05)] hover:bg-slate-950">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <Link to={`/profile/${author.username}`} className="flex items-center gap-3 group/author">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-sm font-bold text-white overflow-hidden ring-2 ring-slate-800 transition-all group-hover/author:ring-blue-500/50">
                            {author.avatarUrl ? (
                                <img src={author.avatarUrl} alt={author.username} className="h-full w-full object-cover" />
                            ) : (
                                <span>{author.username?.[0]?.toUpperCase()}</span>
                            )}
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-white group-hover/author:text-blue-400 transition-colors">{author.displayName}</div>
                            <div className="text-xs text-slate-500">{timeAgo}</div>
                        </div>
                    </Link>
                    <PostTypeBadge type={post.type as any} />
                </div>

                {/* Content */}
                <Link to={`/thread/${post.id}`} className="block space-y-3">
                    {/* Title */}
                    <h3 className="text-xl font-bold leading-tight text-white group-hover:text-blue-400 transition-colors">
                        {post.title}
                    </h3>

                    {/* Context (if present) */}
                    {post.context && post.type !== "PROJECT_UPDATE" && (
                        <p className="text-sm text-slate-500 italic">
                            {post.context}
                        </p>
                    )}

                    {/* Type-specific preview */}
                    <div className="mt-3">
                        {renderPreview()}
                    </div>
                </Link>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                        {post.tags.slice(0, 5).map(tag => (
                            <span
                                key={tag}
                                className="text-xs font-medium text-blue-400 bg-blue-950/30 px-2 py-1 rounded-md border border-blue-500/20"
                            >
                                #{tag}
                            </span>
                        ))}
                        {post.tags.length > 5 && (
                            <span className="text-xs text-slate-500">+{post.tags.length - 5} more</span>
                        )}
                    </div>
                )}

                {/* Attachments */}
                {post.attachments && post.attachments.length > 0 && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                        <ExternalLink className="h-3 w-3" />
                        <span>{post.attachments.length} link{post.attachments.length > 1 ? 's' : ''} attached</span>
                    </div>
                )}

                {/* Actions */}
                <div className="mt-5 flex items-center gap-6 pt-4 border-t border-slate-800/50">
                    <button
                        onClick={handleHelpful}
                        className={`flex items-center gap-2 text-sm font-medium transition-colors ${liked
                            ? "text-blue-400"
                            : "text-slate-400 hover:text-blue-400"
                            }`}
                    >
                        <ThumbsUp className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
                        <span>{helpfulCount}</span>
                    </button>
                    <button
                        onClick={handleCommentClick}
                        className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                    >
                        <MessageSquare className="h-4 w-4" />
                        <span>{commentsCount || 0}</span>
                    </button>
                    <button
                        onClick={handleShare}
                        className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors ml-auto"
                    >
                        <Share2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Share</span>
                    </button>
                </div>
            </div>

            <CommentsModal
                isOpen={isCommentsOpen}
                onClose={() => setIsCommentsOpen(false)}
                post={post}
                onCommentAdded={() => {
                    setCommentsCount(prev => prev + 1);
                }}
            />
        </>
    );
}
