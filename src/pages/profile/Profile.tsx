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
            <div className="h-full overflow-y-auto pb-20 md:pb-0">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Cover skeleton */}
                    <div className="h-64 bg-slate-800 animate-pulse rounded-b-2xl" />

                    {/* Profile info skeleton */}
                    <div className="px-4 space-y-4 -mt-16">
                        <div className="h-32 w-32 rounded-2xl bg-slate-800 animate-pulse border-4 border-slate-950" />
                        <div className="space-y-2">
                            <div className="h-8 w-48 bg-slate-800 rounded animate-pulse" />
                            <div className="h-4 w-32 bg-slate-800 rounded animate-pulse" />
                            <div className="h-4 w-64 bg-slate-800 rounded animate-pulse" />
                        </div>
                    </div>

                    {/* Posts skeleton */}
                    <div className="px-4 space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-48 bg-slate-800 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="mb-4">
                        <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                            <UserIcon className="h-8 w-8 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Failed to Load Profile</h2>
                        <p className="text-slate-400 mb-6">{error}</p>
                    </div>
                    <Button
                        onClick={fetchProfile}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    if (!profileUser) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-300 mb-2">User not found</h2>
                    <p className="text-slate-500">This profile doesn't exist or has been removed.</p>
                </div>
            </div>
        );
    }

    const safeUser = getSafeUser(profileUser);
    const coverUrl = safeUser.coverUrl;

    return (
        <>
            <div className="h-full overflow-y-auto pb-20 md:pb-0">
                <div className="max-w-4xl mx-auto">
                    {/* Cover Image */}
                    <div className="relative h-64 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 group">
                        {coverUrl && (
                            <img
                                src={coverUrl}
                                alt="Cover"
                                className="w-full h-full object-cover transition-opacity duration-700 ease-in-out"
                                style={{ opacity: 1 }}
                                key={(profileUser as any)._coverTimestamp || coverUrl}
                            />
                        )}

                        {/* Upload cover button (owner only) */}
                        {isOwnProfile && (
                            <button
                                onClick={handleCoverUpload}
                                disabled={uploadingCover}
                                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-medium transition-all opacity-0 group-hover:opacity-100 flex items-center gap-2"
                            >
                                {uploadingCover ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {coverProgress}%
                                    </>
                                ) : (
                                    <>
                                        <Camera className="h-4 w-4" />
                                        Change Cover
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Profile Info */}
                    <div className="px-4 md:px-6 pb-6">
                        {/* Avatar & Edit Button */}
                        <div className="flex items-end justify-between -mt-16 mb-4">
                            <div className="relative group">
                                <div className="h-32 w-32 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-4xl font-bold text-white overflow-hidden border-4 border-slate-950 ring-4 ring-slate-800">
                                    {safeUser.avatarUrl ? (
                                        <img
                                            src={safeUser.avatarUrl}
                                            alt={safeUser.username}
                                            className="h-full w-full object-cover transition-opacity duration-700 ease-in-out"
                                            style={{ opacity: 1 }}
                                            key={(profileUser as any)._avatarTimestamp || safeUser.avatarUrl}
                                        />
                                    ) : (
                                        <span>{safeUser.username[0]?.toUpperCase()}</span>
                                    )}
                                </div>

                                {/* Upload avatar button (owner only) */}
                                {isOwnProfile && (
                                    <button
                                        onClick={handleAvatarUpload}
                                        disabled={uploadingAvatar}
                                        className="absolute inset-0 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        {uploadingAvatar ? (
                                            <div className="text-white text-center">
                                                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-1" />
                                                <span className="text-xs">{avatarProgress}%</span>
                                            </div>
                                        ) : (
                                            <div className="text-white text-center">
                                                <Camera className="h-6 w-6 mx-auto mb-1" />
                                                <span className="text-xs font-medium">Change</span>
                                            </div>
                                        )}
                                    </button>
                                )}
                            </div>

                            {isOwnProfile && (
                                <div className="flex items-center gap-2">
                                    <Link to="/settings">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-10 w-10 md:hidden bg-slate-900/50 border-slate-800 backdrop-blur-sm"
                                        >
                                            <Settings className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <Button
                                        onClick={() => setIsEditModalOpen(true)}
                                        variant="outline"
                                        className="gap-2 bg-slate-900/50 border-slate-800 backdrop-blur-sm"
                                    >
                                        <Edit3 className="h-4 w-4" />
                                        <span className="hidden sm:inline">Edit Profile</span>
                                        <span className="sm:hidden">Edit</span>
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* User Details */}
                        <div className="space-y-3">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold text-white tracking-tight">{safeUser.displayName}</h1>
                                    {(profileUser.level !== undefined && profileUser.level !== null) && (
                                        <LevelBadge level={profileUser.level} />
                                    )}
                                </div>
                                <p className="text-slate-400 font-medium">@{safeUser.username}</p>
                            </div>

                            {profileUser.bio && (
                                <p className="text-slate-300 leading-relaxed">{profileUser.bio}</p>
                            )}

                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                                {(profileUser as any).location && (
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        <span>{(profileUser as any).location}</span>
                                    </div>
                                )}

                                {(profileUser as any).website && (
                                    <a
                                        href={(profileUser as any).website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 hover:text-blue-400 transition-colors"
                                    >
                                        <Globe className="h-4 w-4" />
                                        <span>{(profileUser as any).website.replace(/^https?:\/\//, '')}</span>
                                    </a>
                                )}

                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>Joined {formatJoinDate(profileUser.createdAt || '')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex items-center gap-6 mt-8 border-b border-slate-800">
                            <button
                                onClick={() => setActiveTab("POSTS")}
                                className={cn(
                                    "pb-4 text-sm font-medium transition-colors relative",
                                    activeTab === "POSTS" ? "text-white" : "text-slate-500 hover:text-slate-300"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <Grid className="h-4 w-4" />
                                    Posts
                                </div>
                                {activeTab === "POSTS" && (
                                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full" />
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab("PROJECTS")}
                                className={cn(
                                    "pb-4 text-sm font-medium transition-colors relative",
                                    activeTab === "PROJECTS" ? "text-white" : "text-slate-500 hover:text-slate-300"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <FolderGit2 className="h-4 w-4" />
                                    Projects
                                </div>
                                {activeTab === "PROJECTS" && (
                                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full" />
                                )}
                            </button>
                        </div>

                        {/* Content Section */}
                        <div className="py-6 space-y-4">
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
                                        <div className="text-center py-12 text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-800/50">
                                            <p>No posts yet</p>
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
                                        <div className="col-span-full text-center py-12 text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-800/50">
                                            <FolderGit2 className="h-12 w-12 mx-auto mb-3 text-slate-600" />
                                            <p className="text-lg font-medium text-slate-400">No projects yet</p>
                                            {isOwnProfile && (
                                                <Link to="/create-project">
                                                    <Button variant="link" className="text-blue-400 mt-2">
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
