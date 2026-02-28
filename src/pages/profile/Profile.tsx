import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Globe, Edit3, Camera, Loader2, User as UserIcon, Settings, FolderGit2, Grid } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { User, Post, Project } from "@/lib/types";
import PostCard from "@/components/feed/PostCard";
import ProjectCard from "@/components/projects/ProjectCard";
import LevelBadge from "@/components/ui/LevelBadge";
import { getSafeUser, getSafePost, getSafeProject } from "@/lib/normalization";
import EditProfileModal from "@/components/profile/EditProfileModal";
import { type UploadProgress } from "@/lib/imageUpload";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

// Safe date formatting
function formatJoinDate(dateStr: string): string {
    if (!dateStr) return "Recently";

    try {
        // Handle both ISO and SQL formats
        let date: Date;
        if (dateStr.includes('T')) {
            date = new Date(dateStr);
        } else if (dateStr.includes(' ')) {
            date = new Date(dateStr.replace(' ', 'T'));
        } else {
            date = new Date(dateStr);
        }

        if (isNaN(date.getTime())) return "Recently";

        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const year = date.getFullYear();
        return `${month} ${year}`;
    } catch {
        return "Recently";
    }
}

export default function Profile() {
    const { handle } = useParams();
    const { user: currentUser } = useAuth();

    const [profileUser, setProfileUser] = useState<User | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [avatarProgress, setAvatarProgress] = useState(0);
    const [coverProgress, setCoverProgress] = useState(0);
    const [activeTab, setActiveTab] = useState<"POSTS" | "PROJECTS">("POSTS");

    // Determine if viewing own profile
    const isOwnProfile = !handle || handle === currentUser?.username || handle === "me";

    const fetchProfile = async () => {
        setLoading(true);
        setError(null);

        try {
            // CRITICAL: Use handle from route params, fallback to currentUser if "me" or undefined (accessed via /profile/me)
            const targetUsername = (!handle || handle === "me") ? currentUser?.username : handle;

            if (!targetUsername) {
                console.error("[Profile] No username available:", { handle, currentUser: currentUser?.username });
                setError("Username not found");
                return;
            }

            console.log("[Profile] Fetching profile for:", targetUsername);

            const [userRes, postsRes, projectsRes] = await Promise.all([
                api.get(`/users/${targetUsername}`),
                api.get(`/users/${targetUsername}/posts?limit=20`),
                api.get(`/users/${targetUsername}/projects`) // Fetch only this user's projects
            ]);

            console.log("[Profile] User data:", userRes.data);
            console.log("[Profile] Posts data:", postsRes.data);
            console.log("[Profile] Projects data:", projectsRes.data);

            // Parse user
            const rawUser = userRes.data.user || userRes.data.data?.user || userRes.data.data || userRes.data;
            setProfileUser(rawUser);

            // Parse posts
            let rawPosts: any[] = [];
            if (Array.isArray(postsRes.data)) {
                rawPosts = postsRes.data;
            } else if (Array.isArray(postsRes.data.posts)) {
                rawPosts = postsRes.data.posts;
            } else if (Array.isArray(postsRes.data.data)) {
                rawPosts = postsRes.data.data;
            } else if (Array.isArray(postsRes.data.data?.posts)) {
                rawPosts = postsRes.data.data.posts;
            }

            const normalizedPosts = rawPosts.map(p => getSafePost(p));
            setPosts(normalizedPosts);



            // Parse projects
            let rawProjects: any[] = [];
            if (Array.isArray(projectsRes.data)) {
                rawProjects = projectsRes.data;
            } else if (Array.isArray(projectsRes.data.data)) {
                rawProjects = projectsRes.data.data;
            } else if (projectsRes.data.data?.projects && Array.isArray(projectsRes.data.data.projects)) {
                rawProjects = projectsRes.data.data.projects;
            } else if (Array.isArray(projectsRes.data.projects)) {
                rawProjects = projectsRes.data.projects;
            }

            const normalizedProjects = rawProjects
                .map((p: any) => getSafeProject(p))
                .filter((p): p is Project => p !== null);
            setProjects(normalizedProjects);

        } catch (error: any) {
            console.error("[Profile] Failed to fetch:", error);
            setError(error.response?.data?.message || "Failed to load profile");
            toast.error("Failed to load profile");
        } finally {
            // CRITICAL: Always clear loading state
            setLoading(false);
        }
    };

    useEffect(() => {
        // Fetch if handle exists OR if we are intuitively on the "me" profile (handle undefined but component mounted)
        fetchProfile();
        // CRITICAL: Only depend on handle to avoid infinite re-renders
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [handle]);

    const handleEditProfile = (data: { bio?: string; location?: string; website?: string }) => {
        // Optimistic update
        if (profileUser) {
            setProfileUser({
                ...profileUser,
                bio: data.bio,
                location: data.location,
                website: data.website
            } as User);
        }
    };

    const handleAvatarUpload = async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/jpeg,image/jpg,image/png,image/gif,image/webp';

        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            let previewUrl: string | null = null;

            try {
                setUploadingAvatar(true);
                setAvatarProgress(0);

                // Create preview URL
                previewUrl = URL.createObjectURL(file);

                // Show preview immediately
                setProfileUser(prev => prev ? {
                    ...prev,
                    avatarUrl: previewUrl,
                    avatar_url: previewUrl,
                    _avatarTimestamp: Date.now()
                } as User : prev);

                // Upload to server
                const { uploadAvatar } = await import('@/lib/imageUpload');
                const { getFullImageUrl } = await import('@/lib/normalization');

                const serverUrl = await uploadAvatar(file, (progress: UploadProgress) => {
                    setAvatarProgress(progress.percentage);
                });

                console.log('[Profile] Avatar uploaded, server URL:', serverUrl);

                // Convert to full URL
                const fullUrl = getFullImageUrl(serverUrl);
                console.log('[Profile] Full avatar URL:', fullUrl);

                // Wait for smooth transition
                await new Promise(resolve => setTimeout(resolve, 400));

                // Update with server URL
                setProfileUser(prev => prev ? {
                    ...prev,
                    avatarUrl: fullUrl,
                    avatar_url: fullUrl,
                    _avatarTimestamp: Date.now()
                } as User : prev);

                // Cleanup preview
                if (previewUrl) {
                    setTimeout(() => URL.revokeObjectURL(previewUrl!), 1500);
                }

                toast.success('Avatar updated!');
            } catch (error: any) {
                console.error('[Profile] Avatar upload error:', error);
                toast.error(error.message || 'Failed to upload avatar');

                // Cleanup and revert
                if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                }

                // Force re-render to show original
                setProfileUser(prev => prev ? {
                    ...prev,
                    _avatarTimestamp: Date.now()
                } as User : prev);
            } finally {
                setUploadingAvatar(false);
                setAvatarProgress(0);
            }
        };

        input.click();
    };

    const handleCoverUpload = async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/jpeg,image/jpg,image/png,image/gif,image/webp';

        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            let previewUrl: string | null = null;

            try {
                setUploadingCover(true);
                setCoverProgress(0);

                // Create preview URL
                previewUrl = URL.createObjectURL(file);

                // Show preview immediately
                setProfileUser(prev => prev ? {
                    ...prev,
                    coverUrl: previewUrl,
                    cover_url: previewUrl,
                    _coverTimestamp: Date.now()
                } as User : prev);

                // Upload to server
                const { uploadCover } = await import('@/lib/imageUpload');
                const { getFullImageUrl } = await import('@/lib/normalization');

                const serverUrl = await uploadCover(file, (progress: UploadProgress) => {
                    setCoverProgress(progress.percentage);
                });

                console.log('[Profile] Cover uploaded, server URL:', serverUrl);

                // Convert to full URL
                const fullUrl = getFullImageUrl(serverUrl);
                console.log('[Profile] Full cover URL:', fullUrl);

                // Wait for smooth transition
                await new Promise(resolve => setTimeout(resolve, 400));

                // Update with server URL
                setProfileUser(prev => prev ? {
                    ...prev,
                    coverUrl: fullUrl,
                    cover_url: fullUrl,
                    _coverTimestamp: Date.now()
                } as User : prev);

                // Cleanup preview
                if (previewUrl) {
                    setTimeout(() => URL.revokeObjectURL(previewUrl!), 1500);
                }

                toast.success('Cover updated!');
            } catch (error: any) {
                console.error('[Profile] Cover upload error:', error);
                toast.error(error.message || 'Failed to upload cover');

                // Cleanup and revert
                if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                }

                // Force re-render to show original
                setProfileUser(prev => prev ? {
                    ...prev,
                    _coverTimestamp: Date.now()
                } as User : prev);
            } finally {
                setUploadingCover(false);
                setCoverProgress(0);
            }
        };

        input.click();
    };

    if (loading) {
        return (
            <div className="h-full overflow-y-auto pb-20 md:pb-0 relative bg-transparent">
                {/* Ambient Glow */}
                <div className="fixed top-0 left-0 w-[500px] h-[500px] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none z-0" />
                <div className="max-w-4xl mx-auto space-y-6 relative z-10">
                    <div className="h-64 bg-slate-900/40 backdrop-blur-md animate-pulse border-b border-white/5" />
                    <div className="px-4 md:px-8 space-y-4 -mt-16">
                        <div className="h-32 w-32 rounded-2xl bg-slate-800 animate-pulse border border-white/5 shadow-xl" />
                        <div className="space-y-3">
                            <div className="h-8 w-48 bg-slate-800/50 rounded animate-pulse" />
                            <div className="h-4 w-32 bg-slate-800/50 rounded animate-pulse" />
                            <div className="h-4 w-64 bg-slate-800/50 rounded animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full flex items-center justify-center p-4 relative bg-transparent">
                <div className="fixed inset-0 bg-slate-950 pointer-events-none -z-10" />
                <div className="text-center max-w-md bg-slate-900/40 backdrop-blur-xl border border-white/5 p-10 rounded-[2rem] shadow-2xl relative">
                    <div className="mb-4">
                        <div className="absolute -inset-1 bg-red-500/20 rounded-[2rem] blur-xl" />
                        <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 border border-red-500/20 relative">
                            <UserIcon className="h-8 w-8 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2 relative">Failed to Load Profile</h2>
                        <p className="text-slate-400 mb-6 font-light relative">{error}</p>
                    </div>
                    <Button
                        onClick={fetchProfile}
                        className="bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] border-0 rounded-xl px-8 relative z-10"
                    >
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    if (!profileUser) {
        return (
            <div className="h-full flex items-center justify-center relative bg-transparent">
                <div className="fixed inset-0 bg-slate-950 pointer-events-none -z-10" />
                <div className="text-center bg-slate-900/40 backdrop-blur-xl border border-white/5 p-10 rounded-[2rem] shadow-2xl">
                    <h2 className="text-2xl font-bold text-white mb-2">User not found</h2>
                    <p className="text-slate-400 font-light">This profile doesn't exist or has been removed.</p>
                </div>
            </div>
        );
    }

    const safeUser = getSafeUser(profileUser);
    const coverUrl = safeUser.coverUrl;

    return (
        <>
            <div className="h-full overflow-y-auto pb-20 md:pb-0 relative bg-transparent">
                {/* Ambient Glows */}
                <div className="fixed top-0 left-0 w-[500px] h-[500px] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none z-0" />
                <div className="fixed bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-sky-500/5 blur-[150px] pointer-events-none z-0" />

                <div className="max-w-4xl mx-auto relative z-10">
                    {/* Cover Image */}
                    <div className="relative h-64 bg-slate-900 group">
                        {coverUrl && (
                            <img
                                src={coverUrl}
                                alt="Cover"
                                className="w-full h-full object-cover transition-opacity duration-700 ease-in-out mix-blend-screen opacity-60 pointer-events-none"
                                style={{ opacity: 1 }}
                                key={(profileUser as any)._coverTimestamp || coverUrl}
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />

                        {/* Upload cover button (owner only) */}
                        {isOwnProfile && (
                            <button
                                onClick={handleCoverUpload}
                                disabled={uploadingCover}
                                className="absolute top-4 right-4 bg-slate-900/50 hover:bg-slate-900/80 backdrop-blur-md border border-white/10 text-white px-4 py-2 rounded-xl text-sm transition-all opacity-0 group-hover:opacity-100 flex items-center gap-2 shadow-sm"
                            >
                                {uploadingCover ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
                                        {coverProgress}%
                                    </>
                                ) : (
                                    <>
                                        <Camera className="h-4 w-4 text-violet-400" />
                                        Change Cover
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Profile Info */}
                    <div className="px-4 md:px-8 pb-10">
                        {/* Avatar & Edit Button */}
                        <div className="flex items-end justify-between -mt-16 mb-4 relative z-20">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-br from-violet-600/30 to-sky-500/30 rounded-[1.2rem] blur-xl opacity-100" />
                                <div className="h-32 w-32 rounded-[1.2rem] bg-slate-900 flex items-center justify-center text-4xl font-bold text-white overflow-hidden border border-white/10 ring-4 ring-slate-950 relative shadow-2xl">
                                    {safeUser.avatarUrl ? (
                                        <img
                                            src={safeUser.avatarUrl}
                                            alt={safeUser.username}
                                            className="h-full w-full object-cover transition-opacity duration-700 ease-in-out"
                                            style={{ opacity: 1 }}
                                            key={(profileUser as any)._avatarTimestamp || safeUser.avatarUrl}
                                        />
                                    ) : (
                                        <span className="bg-gradient-to-br from-violet-400 to-sky-400 bg-clip-text text-transparent">
                                            {safeUser.username[0]?.toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                {/* Upload avatar button (owner only) */}
                                {isOwnProfile && (
                                    <button
                                        onClick={handleAvatarUpload}
                                        disabled={uploadingAvatar}
                                        className="absolute inset-0 bg-slate-900/60 hover:bg-slate-900/80 backdrop-blur-sm rounded-[1.2rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-white/10"
                                    >
                                        {uploadingAvatar ? (
                                            <div className="text-white text-center">
                                                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-1 text-violet-400" />
                                                <span className="text-xs font-mono">{avatarProgress}%</span>
                                            </div>
                                        ) : (
                                            <div className="text-white text-center">
                                                <Camera className="h-6 w-6 mx-auto mb-1 text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
                                            </div>
                                        )}
                                    </button>
                                )}
                            </div>

                            {isOwnProfile && (
                                <div className="flex items-center gap-2 mb-2">
                                    <Link to="/settings">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-11 w-11 md:hidden bg-slate-900/40 border-white/5 backdrop-blur-md hover:bg-white/5 hover:text-white transition-all rounded-xl shadow-sm"
                                        >
                                            <Settings className="h-5 w-5" />
                                        </Button>
                                    </Link>
                                    <Button
                                        onClick={() => setIsEditModalOpen(true)}
                                        variant="outline"
                                        className="gap-2 bg-slate-900/40 border-white/5 backdrop-blur-md hover:bg-white/5 hover:text-white transition-all rounded-xl h-11 px-5 shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
                                    >
                                        <Edit3 className="h-4 w-4 text-violet-400" />
                                        <span className="hidden sm:inline font-medium">Edit Profile</span>
                                        <span className="sm:hidden font-medium">Edit</span>
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* User Details */}
                        <div className="space-y-4 max-w-2xl relative z-10">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">{safeUser.displayName}</h1>
                                    {(profileUser.level !== undefined && profileUser.level !== null) && (
                                        <LevelBadge level={profileUser.level} />
                                    )}
                                </div>
                                <p className="text-[15px] font-mono text-violet-400/80">@{safeUser.username}</p>
                            </div>

                            {profileUser.bio && (
                                <p className="text-[15px] font-light text-slate-300 leading-relaxed drop-shadow-sm">{profileUser.bio}</p>
                            )}

                            <div className="flex flex-wrap items-center gap-5 text-[14px] text-slate-400/80 pt-2 border-t border-white/5">
                                {(profileUser as any).location && (
                                    <div className="flex items-center gap-1.5 font-light">
                                        <MapPin className="h-4 w-4 text-slate-500" />
                                        <span>{(profileUser as any).location}</span>
                                    </div>
                                )}

                                {(profileUser as any).website && (
                                    <a
                                        href={(profileUser as any).website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 hover:text-blue-400 transition-colors font-light"
                                    >
                                        <Globe className="h-4 w-4 text-blue-500" />
                                        <span>{(profileUser as any).website.replace(/^https?:\/\//, '')}</span>
                                    </a>
                                )}

                                <div className="flex items-center gap-1.5 font-light">
                                    <Calendar className="h-4 w-4 text-slate-500" />
                                    <span>Joined {formatJoinDate(profileUser.createdAt || '')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex items-center gap-6 mt-8 border-b border-white/5 relative z-10">
                            <button
                                onClick={() => setActiveTab("POSTS")}
                                className={cn(
                                    "pb-4 text-[15px] font-medium transition-colors relative",
                                    activeTab === "POSTS" ? "text-white" : "text-slate-500 hover:text-slate-300"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <Grid className={cn("h-4 w-4 transition-colors", activeTab === "POSTS" ? "text-violet-400" : "")} />
                                    Posts
                                </div>
                                {activeTab === "POSTS" && (
                                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-violet-500 rounded-t-full drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab("PROJECTS")}
                                className={cn(
                                    "pb-4 text-[15px] font-medium transition-colors relative",
                                    activeTab === "PROJECTS" ? "text-white" : "text-slate-500 hover:text-slate-300"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <FolderGit2 className={cn("h-4 w-4 transition-colors", activeTab === "PROJECTS" ? "text-violet-400" : "")} />
                                    Projects
                                </div>
                                {activeTab === "PROJECTS" && (
                                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-violet-500 rounded-t-full drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                                )}
                            </button>
                        </div>

                        {/* Content Section */}
                        <div className="py-8 space-y-4 relative z-10">
                            {activeTab === "POSTS" && (
                                <div className="space-y-4">
                                    {posts && posts.length > 0 ? (
                                        posts.map(post => (
                                            <PostCard
                                                key={post.id}
                                                post={post}
                                            />
                                        ))
                                    ) : (
                                        <div className="text-center py-16 text-slate-500 bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                                            <p className="font-light">No posts yet</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "PROJECTS" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {projects && projects.length > 0 ? (
                                        projects.map(project => (
                                            <div key={project.id} className="h-full">
                                                <ProjectCard project={project} />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full text-center py-16 text-slate-500 bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                                            <FolderGit2 className="h-12 w-12 mx-auto mb-4 text-violet-500/50 drop-shadow-[0_0_8px_rgba(139,92,246,0.2)]" />
                                            <p className="text-lg font-medium text-slate-300">No projects yet</p>
                                            {isOwnProfile && (
                                                <Link to="/create-project">
                                                    <Button variant="link" className="text-violet-400 mt-2 hover:text-violet-300 decoration-violet-500/30">
                                                        Create your first project
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Edit Profile Modal */}
                <EditProfileModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    currentBio={profileUser.bio}
                    currentLocation={(profileUser as any).location}
                    currentWebsite={(profileUser as any).website}
                    onSuccess={handleEditProfile}
                />
            </div>
        </>
    );
}
