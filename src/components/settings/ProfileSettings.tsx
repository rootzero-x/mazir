import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Camera, RefreshCw, Globe } from "lucide-react";
import type { User } from "@/lib/types";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { pickAndUploadImage } from "@/lib/imageUpload";
import { getFullImageUrl } from "@/lib/normalization";
import { SectionTitle } from "./ui/SectionTitle";

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

            await api.patch("/users/me", updates);

            toast.success("Profile updated successfully");
            onUpdate();
        } catch (error: any) {
            console.error("Profile update failed:", error);
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async () => {
        setUploadingAvatar(true);
        try {
            await pickAndUploadImage('avatar', (progress) => {
                console.log("Avatar upload:", progress.percentage);
            });

            toast.success("Avatar updated!");
            onUpdate();
        } catch (error: any) {
            if (error.message !== 'User cancelled image selection') {
                toast.error("Failed to upload avatar");
                console.error("Avatar upload error:", error);
            }
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleCoverUpload = async () => {
        setUploadingCover(true);
        try {
            await pickAndUploadImage('cover', (progress) => {
                console.log("Cover upload:", progress.percentage);
            });
            toast.success("Cover image updated!");
            onUpdate();
        } catch (error: any) {
            if (error.message !== 'User cancelled image selection') {
                toast.error("Failed to upload cover image");
                console.error("Cover upload error:", error);
            }
        } finally {
            setUploadingCover(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 pb-8">
            <SectionTitle
                title="Public Profile"
                description="Customize how others see you on the platform."
                icon={<Globe className="h-6 w-6" />}
            />

            <div className="space-y-8 mt-8">
                {/* --- Images Section --- */}
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* Avatar */}
                    <div className="flex items-center gap-5">
                        <div className="relative group shrink-0">
                            <div className="h-24 w-24 rounded-full overflow-hidden border-[3px] border-slate-800 bg-slate-900 shadow-[0_0_20px_rgba(139,92,246,0.2)] relative z-10 transition-transform duration-300 group-hover:scale-[1.02]">
                                {user.avatarUrl ? (
                                    <img src={getFullImageUrl(user.avatarUrl)} alt={user.username} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-violet-600 to-sky-500 text-white font-bold text-3xl shadow-inner">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <Button
                                size="icon"
                                className="absolute bottom-0 right-0 h-9 w-9 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 z-20 hover:border-violet-500/50 transition-colors"
                                onClick={handleAvatarUpload}
                                disabled={uploadingAvatar}
                            >
                                {uploadingAvatar ? <RefreshCw className="h-4 w-4 animate-spin text-violet-400" /> : <Camera className="h-4 w-4 text-slate-300" />}
                            </Button>
                        </div>
                        <div className="space-y-1 hidden sm:block">
                            <h3 className="text-[14px] font-medium text-slate-300">Profile Photo</h3>
                            <p className="text-[12px] text-slate-500">Recommended 400x400px</p>
                        </div>
                    </div>

                    {/* Cover Image */}
                    <div className="flex-1 w-full relative group mt-2 md:mt-0">
                        <div className="h-32 w-full rounded-2xl overflow-hidden border border-white/5 bg-slate-900/40 relative group-hover:border-violet-500/30 transition-colors shadow-inner">
                            {user.coverUrl ? (
                                <img src={getFullImageUrl(user.coverUrl)} alt="Cover" className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            ) : (
                                <div className="h-full w-full bg-slate-800/30 flex items-center justify-center text-slate-500 text-xs italic">
                                    No cover image uploaded
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                <Button
                                    variant="secondary"
                                    className="gap-2 bg-white/10 hover:bg-white/20 text-white border-white/10 backdrop-blur-md rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                                    onClick={handleCoverUpload}
                                    disabled={uploadingCover}
                                >
                                    {uploadingCover ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                                    <span className="text-[13px] font-medium">Change Cover</span>
                                </Button>
                            </div>
                        </div>
                        {/* Fallback button for mobile users where hover is tricky */}
                        <div className="md:hidden mt-3 flex justify-end">
                            <Button
                                size="sm"
                                variant="outline"
                                className="gap-2 border-slate-700 bg-slate-900/50 rounded-xl w-full text-slate-300"
                                onClick={handleCoverUpload}
                                disabled={uploadingCover}
                            >
                                {uploadingCover ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
                                <span className="text-xs">Update Cover</span>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* --- Form Fields --- */}
                <div className="panel-container border border-white/5 bg-slate-900/20 rounded-2xl overflow-hidden shadow-inner p-5 sm:p-6 space-y-6">
                    {/* Bio */}
                    <div className="space-y-2">
                        <label className="text-[13px] font-medium text-slate-400 uppercase tracking-widest pl-1">Bio</label>
                        <Textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell us about yourself..."
                            className="bg-slate-950/60 border-slate-700/50 min-h-[120px] focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50 rounded-xl resize-y text-[15px] leading-relaxed shadow-inner"
                        />
                        <p className="text-[12px] text-slate-500 text-right mt-1">{bio.length}/160</p>
                    </div>

                    {/* Location & Website */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[13px] font-medium text-slate-400 uppercase tracking-widest pl-1">Location</label>
                            <Input
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="City, Country"
                                className="bg-slate-950/60 border-slate-700/50 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50 rounded-xl transition-all shadow-inner"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[13px] font-medium text-slate-400 uppercase tracking-widest pl-1">Website</label>
                            <Input
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                placeholder="https://"
                                className="bg-slate-950/60 border-slate-700/50 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50 rounded-xl transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end">
                        <Button
                            onClick={handleSave}
                            disabled={loading || bio === user.bio}
                            className="bg-violet-600/90 hover:bg-violet-500 text-white rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] border border-violet-500/50 transition-all font-medium py-2 px-6 w-full sm:w-auto"
                        >
                            {loading ? "Saving..." : "Save Profile"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
