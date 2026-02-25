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
            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div className="h-8 w-32 bg-slate-800 rounded animate-pulse" />
                    <div className="h-8 w-20 bg-slate-800 rounded animate-pulse" />
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto pb-20 md:pb-0">
            <div className="max-w-3xl mx-auto space-y-6 p-4">
                <div className="flex items-center justify-between sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md pt-[calc(env(safe-area-inset-top,0px)+1rem)] pb-4 px-4 -mx-4 border-b border-slate-800/50">
                    <h1 className="text-2xl font-bold tracking-tight text-white">Your Feed</h1>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/notifications')}
                            className="relative text-slate-400 hover:text-white"
                        >
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                            )}
                        </Button>
                        <Button
                            onClick={openCreatePost}
                            className="bg-blue-600 hover:bg-blue-500 text-white gap-2 font-semibold shadow-lg shadow-blue-500/20"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">Create Post</span>
                            <span className="sm:hidden">Post</span>
                        </Button>
                    </div>
                </div>

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
                        <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-4 rounded-3xl border border-dashed border-slate-800 bg-slate-900/30">
                            <div className="h-16 w-16 rounded-2xl bg-slate-800/50 flex items-center justify-center">
                                <span className="text-4xl">📝</span>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-medium text-white">No posts yet</h3>
                                <p className="text-slate-400 max-w-xs mx-auto">
                                    Be the first to share something with the community!
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={openCreatePost}
                                className="mt-2 border-slate-700 hover:bg-slate-800 text-slate-200"
                            >
                                Create First Post
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
