import { X, Loader2, Plus, Tag as TagIcon, Link as LinkIcon } from "lucide-react";
import { useState, Fragment, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { toast } from "react-hot-toast";
import api from "@/lib/api";
import type { PostType, PostFormData } from "@/lib/postValidation";
import { validatePostByType, formatPostForAPI, getFieldPlaceholder } from "@/lib/postValidation";

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPostCreated: () => void;
}

export default function CreatePostModal({ isOpen, onClose, onPostCreated }: CreatePostModalProps) {
    const [formData, setFormData] = useState<PostFormData>({
        type: "INSIGHT",
        title: "",
        context: "",
        problem: "",
        attempt: "",
        solution: "",
        result: "",
        result_text: "",
        tags: [],
        attachments: []
    });

    const [rooms, setRooms] = useState<any[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [linkInput, setLinkInput] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch rooms on mount
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const { data } = await api.get("/rooms");
                const roomsList = Array.isArray(data) ? data : data?.rooms || data?.data || [];
                setRooms(roomsList);
            } catch (error) {
                console.error("[CreatePost] Failed to fetch rooms:", error);
            }
        };

        if (isOpen) {
            fetchRooms();
        }
    }, [isOpen]);

    const handleTypeChange = (type: PostType) => {
        setFormData(prev => ({ ...prev, type }));
        setErrors({});
    };

    const handleInputChange = (field: keyof PostFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleAddTag = () => {
        if (!tagInput.trim()) return;
        if (formData.tags.includes(tagInput.trim())) {
            toast.error("Tag already added");
            return;
        }
        setFormData(prev => ({
            ...prev,
            tags: [...prev.tags, tagInput.trim()]
        }));
        setTagInput("");
    };

    const handleRemoveTag = (tag: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tag)
        }));
    };

    const handleAddLink = () => {
        if (!linkInput.trim()) return;
        try {
            new URL(linkInput); // Validate URL
            setFormData(prev => ({
                ...prev,
                attachments: [...prev.attachments, { kind: "link", url: linkInput.trim() }]
            }));
            setLinkInput("");
        } catch {
            toast.error("Invalid URL");
        }
    };

    const handleRemoveLink = (index: number) => {
        setFormData(prev => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async () => {
        // Validate
        const validationErrors = validatePostByType(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            toast.error("Please fix the errors");
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = formatPostForAPI(formData);

            console.log("[CreatePost] Submitting:", payload);

            await api.post("/posts", payload);

            toast.success("Post created successfully!");

            // Reset form
            setFormData({
                type: "INSIGHT",
                title: "",
                context: "",
                problem: "",
                attempt: "",
                solution: "",
                result: "",
                result_text: "",
                tags: [],
                attachments: []
            });
            setErrors({});

            onPostCreated();
            onClose();
        } catch (error: any) {
            console.error("[CreatePost] Failed:", error);
            toast.error(error.response?.data?.message || "Failed to create post");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderConditionalFields = () => {
        switch (formData.type) {
            case "BUG":
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Problem <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                value={formData.problem}
                                onChange={(e) => handleInputChange("problem", e.target.value)}
                                placeholder={getFieldPlaceholder("BUG", "problem")}
                                className={`w-full h-24 bg-slate-950 border ${errors.problem ? 'border-red-500' : 'border-slate-800'} rounded-xl p-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                                disabled={isSubmitting}
                            />
                            {errors.problem && <p className="text-red-400 text-xs mt-1">{errors.problem}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                What did you try? (optional)
                            </label>
                            <textarea
                                value={formData.attempt}
                                onChange={(e) => handleInputChange("attempt", e.target.value)}
                                placeholder={getFieldPlaceholder("BUG", "attempt")}
                                className="w-full h-20 bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Solution <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                value={formData.solution}
                                onChange={(e) => handleInputChange("solution", e.target.value)}
                                placeholder={getFieldPlaceholder("BUG", "solution")}
                                className={`w-full h-24 bg-slate-950 border ${errors.solution ? 'border-red-500' : 'border-slate-800'} rounded-xl p-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                                disabled={isSubmitting}
                            />
                            {errors.solution && <p className="text-red-400 text-xs mt-1">{errors.solution}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Result (optional)
                            </label>
                            <textarea
                                value={formData.result}
                                onChange={(e) => handleInputChange("result", e.target.value)}
                                placeholder={getFieldPlaceholder("BUG", "result")}
                                className="w-full h-20 bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                disabled={isSubmitting}
                            />
                        </div>
                    </>
                );

            case "SOLUTION":
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Problem <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                value={formData.problem}
                                onChange={(e) => handleInputChange("problem", e.target.value)}
                                placeholder={getFieldPlaceholder("SOLUTION", "problem")}
                                className={`w-full h-24 bg-slate-950 border ${errors.problem ? 'border-red-500' : 'border-slate-800'} rounded-xl p-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                                disabled={isSubmitting}
                            />
                            {errors.problem && <p className="text-red-400 text-xs mt-1">{errors.problem}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Solution <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                value={formData.solution}
                                onChange={(e) => handleInputChange("solution", e.target.value)}
                                placeholder={getFieldPlaceholder("SOLUTION", "solution")}
                                className={`w-full h-24 bg-slate-950 border ${errors.solution ? 'border-red-500' : 'border-slate-800'} rounded-xl p-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                                disabled={isSubmitting}
                            />
                            {errors.solution && <p className="text-red-400 text-xs mt-1">{errors.solution}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Result (optional)
                            </label>
                            <textarea
                                value={formData.result}
                                onChange={(e) => handleInputChange("result", e.target.value)}
                                placeholder={getFieldPlaceholder("SOLUTION", "result")}
                                className="w-full h-20 bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                disabled={isSubmitting}
                            />
                        </div>
                    </>
                );

            case "INSIGHT":
                return (
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Your Insight <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            value={formData.result_text}
                            onChange={(e) => handleInputChange("result_text", e.target.value)}
                            placeholder={getFieldPlaceholder("INSIGHT", "result_text")}
                            className={`w-full h-32 bg-slate-950 border ${errors.result_text ? 'border-red-500' : 'border-slate-800'} rounded-xl p-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                            disabled={isSubmitting}
                        />
                        {errors.result_text && <p className="text-red-400 text-xs mt-1">{errors.result_text}</p>}
                    </div>
                );

            case "PROJECT_UPDATE":
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                What Changed? <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                value={formData.context}
                                onChange={(e) => handleInputChange("context", e.target.value)}
                                placeholder={getFieldPlaceholder("PROJECT_UPDATE", "context")}
                                className={`w-full h-24 bg-slate-950 border ${errors.context ? 'border-red-500' : 'border-slate-800'} rounded-xl p-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                                disabled={isSubmitting}
                            />
                            {errors.context && <p className="text-red-400 text-xs mt-1">{errors.context}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Details (optional)
                            </label>
                            <textarea
                                value={formData.result_text}
                                onChange={(e) => handleInputChange("result_text", e.target.value)}
                                placeholder={getFieldPlaceholder("PROJECT_UPDATE", "result_text")}
                                className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                disabled={isSubmitting}
                            />
                        </div>
                    </>
                );

            default:
                return null;
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
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-6 text-left align-middle shadow-xl transition-all max-h-[90vh] overflow-y-auto">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <Dialog.Title as="h3" className="text-xl font-bold text-white">
                                        Create Post
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="space-y-5">
                                    {/* Type Selector */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-3">
                                            Post Type <span className="text-red-400">*</span>
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {(["BUG", "SOLUTION", "INSIGHT", "PROJECT_UPDATE"] as PostType[]).map(type => (
                                                <button
                                                    key={type}
                                                    onClick={() => handleTypeChange(type)}
                                                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${formData.type === type
                                                        ? type === "BUG" ? "bg-red-600 text-white"
                                                            : type === "SOLUTION" ? "bg-green-600 text-white"
                                                                : type === "INSIGHT" ? "bg-blue-600 text-white"
                                                                    : "bg-purple-600 text-white"
                                                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                                        }`}
                                                    disabled={isSubmitting}
                                                >
                                                    {type === "PROJECT_UPDATE" ? "Update" : type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Room Selector */}
                                    {rooms.length > 0 && (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Room (optional)
                                            </label>
                                            <select
                                                value={formData.room_id || ""}
                                                onChange={(e) => handleInputChange("room_id" as any, e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                disabled={isSubmitting}
                                            >
                                                <option value="">No room</option>
                                                {rooms.map(room => (
                                                    <option key={room.slug || room.id} value={room.id}>
                                                        {room.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Title */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Title <span className="text-red-400">*</span> <span className="text-xs text-slate-500">({formData.title.length}/160)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => handleInputChange("title", e.target.value)}
                                            placeholder={getFieldPlaceholder(formData.type, "title")}
                                            maxLength={160}
                                            className={`w-full bg-slate-950 border ${errors.title ? 'border-red-500' : 'border-slate-800'} rounded-xl p-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold`}
                                            disabled={isSubmitting}
                                        />
                                        {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
                                    </div>

                                    {/* Context (optional for most types) */}
                                    {formData.type !== "PROJECT_UPDATE" && (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Context (optional) <span className="text-xs text-slate-500">({(formData.context || "").length}/160)</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.context}
                                                onChange={(e) => handleInputChange("context", e.target.value)}
                                                placeholder={getFieldPlaceholder(formData.type, "context")}
                                                maxLength={160}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                    )}

                                    {/* Conditional Fields */}
                                    {renderConditionalFields()}

                                    {/* Tags */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Tags
                                        </label>
                                        <div className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                                                placeholder="Add tag and press Enter"
                                                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                disabled={isSubmitting}
                                            />
                                            <button
                                                onClick={handleAddTag}
                                                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                                                disabled={isSubmitting}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                        {formData.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {formData.tags.map(tag => (
                                                    <span
                                                        key={tag}
                                                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-950/50 text-blue-300 rounded-full text-sm"
                                                    >
                                                        <TagIcon className="h-3 w-3" />
                                                        {tag}
                                                        <button
                                                            onClick={() => handleRemoveTag(tag)}
                                                            className="ml-1 hover:text-red-400"
                                                            disabled={isSubmitting}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Attachments */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Links
                                        </label>
                                        <div className="flex gap-2 mb-2">
                                            <input
                                                type="url"
                                                value={linkInput}
                                                onChange={(e) => setLinkInput(e.target.value)}
                                                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddLink())}
                                                placeholder="Add link URL"
                                                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                disabled={isSubmitting}
                                            />
                                            <button
                                                onClick={handleAddLink}
                                                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                                                disabled={isSubmitting}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                        {formData.attachments.length > 0 && (
                                            <div className="space-y-1">
                                                {formData.attachments.map((att, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center gap-2 p-2 bg-slate-950 border border-slate-800 rounded-lg text-sm"
                                                    >
                                                        <LinkIcon className="h-4 w-4 text-slate-400" />
                                                        <span className="flex-1 truncate text-slate-300">{att.url}</span>
                                                        <button
                                                            onClick={() => handleRemoveLink(idx)}
                                                            className="text-slate-400 hover:text-red-400"
                                                            disabled={isSubmitting}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
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
                                                Creating...
                                            </>
                                        ) : (
                                            "Create Post"
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
