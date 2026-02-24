import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User as UserIcon, Camera, RefreshCw } from "lucide-react";
import type { User } from "@/lib/types";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import type { UploadProgress } from "@/lib/imageUpload";
import { pickAndUploadImage } from "@/lib/imageUpload";
import { getFullImageUrl } from "@/lib/normalization";

interface ProfileSettingsProps {
    user: User;
    onUpdate: () => void;
}

export default function ProfileSettings({ user, onUpdate }: ProfileSettingsProps) {
    const [loading, setLoading] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);

    // Form State
    const [bio, setBio] = useState(user.bio || "");
    const [location, setLocation] = useState(""); // Add to type if needed later, for now just UI
    const [website, setWebsite] = useState("");

    const handleSave = async () => {
        setLoading(true);
        try {
            // Only send profile fields
            const updates = {
                bio,
                // location, website // Add these if backend supports them
            };

            await api.patch("/users/me/profile", updates); // Using specific profile endpoint if available, or just PUT /users/me
            // Fallback if specific endpoint doesn't exist:
            // await api.put("/users/me", updates); 

            toast.success("Profile updated successfully");
            onUpdate();
        } catch (error: any) {
            console.error("Profile update failed:", error);
            // Try fallback to standard update if 404
            if (error.response?.status === 404) {
                try {
                    await api.put("/users/me", { bio });
                    toast.success("Profile updated successfully");
                    onUpdate();
                } catch (retryError) {
                    toast.error("Failed to update profile");
                }
            } else {
                toast.error(error.response?.data?.message || "Failed to update profile");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async () => {
        try {
            setUploadingAvatar(true);
            const url = await pickAndUploadImage('avatar', (progress) => {
                console.log("Avatar upload:", progress.percentage);
            });

            // Optimistic update not strictly needed as we call onUpdate, 
            // but we could set local state if we had it.
            toast.success("Avatar updated!");
            onUpdate();
        } catch (error: any) {
            if (error.message !== "No file selected") {
                toast.error("Failed to upload avatar");
                console.error(error);
            }
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleCoverUpload = async () => {
        try {
            setUploadingCover(true);
            const url = await pickAndUploadImage('cover', (progress) => {
                console.log("Cover upload:", progress.percentage);
            });
            toast.success("Cover updated!");
            onUpdate();
        } catch (error: any) {
            if (error.message !== "No file selected") {
                toast.error("Failed to upload cover");
                console.error(error);
            }
        } finally {
            setUploadingCover(false);
        }
    };

    return (
        <section className="space-y-6 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="p-2 rounded-lg bg-pink-500/10 text-pink-500">
                    <UserIcon className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold text-white">Profile Details</h2>
            </div>

            <div className="space-y-6">
                {/* Images */}
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* Avatar */}
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-slate-700 bg-slate-800">
                                {user.avatarUrl ? (
                                    <img src={getFullImageUrl(user.avatarUrl || undefined)} alt={user.username} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-2xl">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <Button
                                size="icon"
                                variant="secondary"
                                className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-lg"
                                onClick={handleAvatarUpload}
                                disabled={uploadingAvatar}
                            >
                                {uploadingAvatar ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
                            </Button>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-white">Profile Photo</h3>
                            <p className="text-xs text-slate-500">Recommended 400x400px</p>
                        </div>
                    </div>

                    {/* Cover */}
                    <div className="flex-1 w-full relative group">
                        <div className="h-32 w-full rounded-lg overflow-hidden border border-slate-700 bg-slate-800 relative">
                            {user.coverUrl ? (
                                <img src={getFullImageUrl(user.coverUrl || undefined)} alt="Cover" className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full bg-slate-800/50 flex items-center justify-center text-slate-500 text-xs">
                                    No cover image
                                </div>
                            )}
                        </div>
                        <Button
                            size="sm"
                            variant="secondary"
                            className="absolute bottom-2 right-2 shadow-lg gap-2"
                            onClick={handleCoverUpload}
                            disabled={uploadingCover}
                        >
                            {uploadingCover ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
                            <span className="text-xs">Change Cover</span>
                        </Button>
                    </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Bio</label>
                    <Textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about yourself..."
                        className="bg-slate-950/50 border-slate-800 min-h-[100px]"
                    />
                    <p className="text-xs text-slate-500">Brief description for your profile.</p>
                </div>

                {/* Location & Website (UI only for now as requested by user to have 'Profile' section) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Location</label>
                        <Input
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="City, Country"
                            className="bg-slate-950/50 border-slate-800"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Website</label>
                        <Input
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            placeholder="https://"
                            className="bg-slate-950/50 border-slate-800"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button
                    onClick={handleSave}
                    disabled={loading || bio === user.bio}
                    className="bg-pink-600 hover:bg-pink-700 text-white"
                >
                    {loading ? "Saving..." : "Save Profile"}
                </Button>
            </div>
        </section>
    );
}
