import { Info, Users, Shield, Hash, X } from "lucide-react";
import type { Room } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";

interface RoomInfoDrawerProps {
    room: Room;
    isOpen: boolean;
    onClose: () => void;
}

export function RoomInfoDrawer({ room, isOpen, onClose }: RoomInfoDrawerProps) {
    const drawerRef = useRef<HTMLDivElement>(null);

    // Close on escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [isOpen, onClose]);

    // Click outside handler
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300
                    ${isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}
                `}
                onClick={handleBackdropClick}
            />

            {/* Drawer */}
            <div
                ref={drawerRef}
                className={`fixed top-0 right-0 bottom-0 z-50 h-full w-full max-w-[360px] bg-[#080c17] border-l border-white/10 shadow-2xl shadow-black transform transition-transform duration-300 ease-in-out
                    ${isOpen ? "translate-x-0" : "translate-x-full"}
                `}
            >
                <div className="flex flex-col h-full bg-[#080c17]">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/5">
                        <h2 className="text-lg font-bold text-slate-100">Room Info</h2>
                        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10 rounded-full">
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        <div className="flex flex-col items-center gap-3 mb-8">
                            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500/20 to-blue-600/5 text-blue-400 border border-blue-500/10 shadow-xl shadow-blue-500/5">
                                {room.icon ? <span className="text-5xl">{room.icon}</span> : <Hash className="h-10 w-10" />}
                            </div>
                            <div className="text-center w-full px-4">
                                <h3 className="text-xl font-bold text-white break-words">{room.name}</h3>
                                <p className="text-sm text-slate-400 mt-1 break-all">id: {room.slug}</p>
                            </div>
                        </div>

                        <div className="space-y-8">

                            {/* Description */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 ml-1 flex items-center gap-2">
                                    <Info className="h-3 w-3" /> About
                                </h4>
                                <div className="rounded-xl border border-white/5 bg-white/5 p-4 transition-colors hover:bg-white/[0.07]">
                                    <p className="text-sm text-slate-300 leading-relaxed font-light">
                                        {room.description || "No description provided for this room."}
                                    </p>
                                </div>
                            </div>

                            {/* Stats */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 ml-1 flex items-center gap-2">
                                    <Users className="h-3 w-3" /> Stats
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="group rounded-xl border border-white/5 bg-slate-900/50 p-4 text-center transition-all hover:bg-slate-800/80 hover:border-blue-500/20">
                                        <div className="text-2xl font-bold text-slate-100 group-hover:text-blue-400 transition-colors">{room.memberCount || 0}</div>
                                        <div className="text-[10px] text-slate-500 uppercase font-medium mt-1">Members</div>
                                    </div>
                                    <div className="group rounded-xl border border-white/5 bg-slate-900/50 p-4 text-center transition-all hover:bg-slate-800/80 hover:border-emerald-500/20">
                                        <div className="text-2xl font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">Public</div>
                                        <div className="text-[10px] text-slate-500 uppercase font-medium mt-1">Access</div>
                                    </div>
                                </div>
                            </div>

                            {/* Rules */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 ml-1 flex items-center gap-2">
                                    <Shield className="h-3 w-3" /> Rules
                                </h4>
                                <div className="space-y-3 rounded-xl border border-white/5 bg-white/5 p-4 text-sm text-slate-400">
                                    <div className="flex gap-3 items-start">
                                        <span className="font-bold text-blue-400/80 mt-0.5">01</span>
                                        <span className="leading-snug">Be respectful to everyone in the chat.</span>
                                    </div>
                                    <div className="flex gap-3 items-start">
                                        <span className="font-bold text-blue-400/80 mt-0.5">02</span>
                                        <span className="leading-snug">No spam, self-promotion, or NSFW content.</span>
                                    </div>
                                    <div className="flex gap-3 items-start">
                                        <span className="font-bold text-blue-400/80 mt-0.5">03</span>
                                        <span className="leading-snug">Keep conversations relevant to the topic.</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
