import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Bell } from "lucide-react";
import api from "@/lib/api";
import type { Post } from "@/lib/types";
import { getSafePost } from "@/lib/normalization";
import PostCard from "@/components/feed/PostCard";
import { seenPostsStorage } from "@/lib/seenPosts";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/context/NotificationContext";
import { useSidebar } from "@/context/SidebarContext";

export default function Feed() {
    const navigate = useNavigate();
    const { unreadCount } = useNotifications();
    const { openCreatePost, lastPostAt } = useSidebar();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = async () => {
        try {
            const { data } = await api.get("/feed");

            // Handle different response structures with strict array checks
            let newPosts: Post[] = [];
            if (Array.isArray(data)) {
                newPosts = data;
            } else if (data?.posts && Array.isArray(data.posts)) {
                newPosts = data.posts;
            } else if (data?.data && Array.isArray(data.data)) {
                newPosts = data.data;
            } else if (data?.data?.posts && Array.isArray(data.data.posts)) {
                newPosts = data.data.posts;
            } else {
                console.warn("Feed API returned unexpected structure:", data);
                newPosts = [];
            }

            // Mark new posts as seen (after valid fetch)
            const postIds = newPosts.map((p: any) => p.id);
            seenPostsStorage.add(postIds);

            const seenIds = seenPostsStorage.get();
            const sorted = [...newPosts].sort((a: any, b: any) => {
                const aSeen = seenIds.includes(a.id);
                const bSeen = seenIds.includes(b.id);
                if (aSeen && !bSeen) return 1;
                if (!aSeen && bSeen) return -1;
                return 0;
            });

            // Normalize all posts
            const normalizedPosts = sorted.map(p => getSafePost(p));
            setPosts(normalizedPosts);
        } catch (error) {
            console.error("Failed to fetch feed:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();

        // Auto-refresh every 5 seconds (silent, user won't notice)
        const interval = setInterval(() => {
            fetchPosts();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    // CRITICAL: Refresh feed when a post is created globally
    useEffect(() => {
        if (lastPostAt > 0) {
            fetchPosts();
        }
    }, [lastPostAt]);

    const handlePostUpdate = (postId: string, updates: Partial<Post>) => {
        setPosts(prevPosts =>
            prevPosts.map(post =>
                post.id === postId
                    ? { ...post, ...updates }
                    : post
            )
        );
    };

    if (loading) {
        return (
            <div className="h-full overflow-y-auto w-full pb-20 md:pb-0 relative scrollbar-thin scrollbar-thumb-violet-500/20 scrollbar-track-transparent">
                <div className="max-w-3xl mx-auto space-y-6 pt-6 pb-20 px-4 sm:px-6 relative z-10 w-full animate-in fade-in duration-500">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                        <div className="h-10 w-40 bg-slate-800/80 rounded-xl animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.02)]" />
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-slate-800/80 rounded-xl animate-pulse" />
                            <div className="h-10 w-32 bg-slate-800/80 rounded-xl animate-pulse hidden sm:block" />
                        </div>
                    </div>
                    <div className="space-y-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/5 p-6 space-y-5 shadow-inner relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 blur-[50px] rounded-full" />
                                <div className="flex gap-4 items-center">
                                    <div className="h-12 w-12 rounded-full bg-slate-800/80 animate-pulse border border-slate-700/50" />
                                    <div className="space-y-2 flex-1">
                                        <div className="h-4 w-1/4 bg-slate-800/80 rounded animate-pulse" />
                                        <div className="h-3 w-1/5 bg-slate-800/60 rounded animate-pulse" />
                                    </div>
                                </div>
                                <div className="space-y-3 pt-2">
                                    <div className="h-6 w-3/4 bg-slate-800/80 rounded-md animate-pulse" />
                                    <div className="h-4 w-full bg-slate-800/60 rounded animate-pulse" />
                                    <div className="h-4 w-5/6 bg-slate-800/60 rounded animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full relative">
            {/* Header - Fixed at the top */}
            <div className="sticky top-0 z-40 bg-transparent backdrop-blur-2xl border-b border-white/5 shadow-sm pt-[env(safe-area-inset-top,0px)]">
                <div className="max-w-3xl mx-auto flex items-center justify-between py-4 px-4 sm:px-6 w-full">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">Your Feed</h1>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/notifications')}
                            className="relative text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        >
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                            )}
                        </Button>
                        <Button
                            onClick={openCreatePost}
                            className="bg-violet-600 hover:bg-violet-500 text-white gap-2 font-medium rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.4)] hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] border-0 transition-all py-2 px-4 relative group"
                        >
                            <span className="absolute inset-0 rounded-xl bg-violet-400/20 blur opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Plus className="h-5 w-5 drop-shadow-md relative z-10" />
                            <span className="hidden sm:inline relative z-10">Create Post</span>
                            <span className="sm:hidden relative z-10">Post</span>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto w-full pb-20 md:pb-0 scrollbar-thin scrollbar-thumb-violet-500/20 scrollbar-track-transparent">
                <div className="max-w-3xl mx-auto space-y-6 pt-6 pb-20 px-4 sm:px-6 relative z-10 w-full animate-in fade-in duration-300">
                    {/* Feed List */}
                    <div className="space-y-6 mt-6">
                        {posts.length > 0 ? (
                            posts.map((post) => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    onUpdate={(updates) => handlePostUpdate(post.id, updates)}
                                />
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-6 rounded-3xl border border-white/5 bg-slate-900/40 backdrop-blur-md shadow-inner relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="h-20 w-20 rounded-2xl bg-slate-950/50 border border-slate-800/50 flex items-center justify-center shadow-[inset_0_0_20px_rgba(139,92,246,0.1)] relative z-10 transition-transform group-hover:scale-105 duration-500">
                                    <span className="text-4xl drop-shadow-lg filter">🚀</span>
                                </div>
                                <div className="space-y-2 relative z-10">
                                    <h3 className="text-xl font-semibold text-white tracking-tight">Your feed is waiting</h3>
                                    <p className="text-slate-400 max-w-sm mx-auto font-light leading-relaxed">
                                        Be the first to ignite the conversation. Share your thoughts, updates, or bugs with the community!
                                    </p>
                                </div>
                                <Button
                                    onClick={openCreatePost}
                                    className="relative z-10 mt-4 bg-violet-600/90 hover:bg-violet-500 text-white rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] border border-violet-500/50 transition-all font-medium py-2 px-8"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create First Post
                                </Button>
                            </div>
                        )}
                    </div>

                    {posts.length > 0 && (
                        <div className="text-center text-xs text-slate-600/80 font-light pt-8 pb-4 tracking-wider">
                            END OF FEED
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
