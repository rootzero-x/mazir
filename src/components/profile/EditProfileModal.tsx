import { X, Loader2 } from "lucide-react";
import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { toast } from "react-hot-toast";
import api from "@/lib/api";

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentBio?: string;
    currentLocation?: string;
    currentWebsite?: string;
    onSuccess: (data: { bio?: string; location?: string; website?: string }) => void;
}

export default function EditProfileModal({
    isOpen,
    onClose,
    currentBio = "",
    currentLocation = "",
    currentWebsite = "",
    onSuccess
}: EditProfileModalProps) {
    const [bio, setBio] = useState(currentBio);
    const [location, setLocation] = useState(currentLocation);
    const [website, setWebsite] = useState(currentWebsite);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);

            const payload = {
                bio: bio.trim() || undefined,
                location: location.trim() || undefined,
                website: website.trim() || undefined
            };

            console.log('[EditProfile] Submitting:', payload);

            await api.patch('/users/me', payload);

            toast.success('Profile updated successfully!');

            onSuccess({
                bio: bio.trim(),
                location: location.trim(),
                website: website.trim()
            });

            onClose();
        } catch (error: any) {
            console.error('[EditProfile] Failed:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsSubmitting(false);
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
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-6 text-left align-middle shadow-xl transition-all">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <Dialog.Title as="h3" className="text-xl font-bold text-white">
                                        Edit Profile
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                                        disabled={isSubmitting}
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {/* Bio */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Bio <span className="text-xs text-slate-500">({bio.length}/160)</span>
                                        </label>
                                        <textarea
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            placeholder="Tell us about yourself..."
                                            maxLength={160}
                                            className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    {/* Location */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Location
                                        </label>
                                        <input
                                            type="text"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            placeholder="Where are you based?"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    {/* Website */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Website
                                        </label>
                                        <input
                                            type="url"
                                            value={website}
                                            onChange={(e) => setWebsite(e.target.value)}
                                            placeholder="https://yourwebsite.com"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="mt-6 flex gap-3 justify-end">
                                    <button
                                        type="button"
                                        className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium transition-colors"
                                        onClick={onClose}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="px-6 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            'Save Changes'
                                        )}
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
