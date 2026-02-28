import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Hash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Room } from "@/lib/types";

interface RoomsListProps {
    rooms: Room[];
    loading: boolean;
    currentSlug?: string;
    onRoomSelect?: () => void; // For mobile to close drawer or navigate
}

export default function RoomsList({ rooms, loading, currentSlug, onRoomSelect }: RoomsListProps) {
    const [search, setSearch] = useState("");

    const filteredRooms = rooms.filter((room) =>
        room.name.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex h-full flex-col gap-4 p-4">
                <div className="h-10 w-full animate-pulse rounded-lg bg-slate-800/50" />
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex h-20 w-full animate-pulse rounded-xl bg-slate-800/30" />
                ))}
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col bg-transparent relative w-full overflow-hidden">
            {/* Default background subtle gradient purely for the list container */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 to-slate-900/30 pointer-events-none z-0" />

            {/* Header / Search */}
            <div className="z-30 bg-transparent backdrop-blur-2xl p-4 pt-6 border-b border-white/5 space-y-4 shadow-[0_4px_30px_rgba(0,0,0,0.1)] shrink-0 relative">
                <h2 className="text-xl font-bold text-white px-2 tracking-tight neon-text-glow">Communities</h2>
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-400 transition-colors" />
                    <Input
                        placeholder="Search rooms..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-slate-900/50 backdrop-blur-sm border-white/5 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 h-10 rounded-xl transition-all shadow-inner text-white placeholder:text-slate-500"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin scrollbar-thumb-violet-500/20 scrollbar-track-transparent relative z-10 w-full overflow-x-hidden">
                {rooms.length === 0 ? (
                    <div className="flex h-40 flex-col items-center justify-center text-center p-4">
                        <p className="text-sm text-slate-400 font-light">No rooms found.</p>
                    </div>
                ) : (
                    <div className="space-y-1.5 pb-20 md:pb-4 w-full px-1">
                        {filteredRooms.map((room) => {
                            const isActive = currentSlug === room.slug;
                            return (
                                <Link
                                    key={room.slug}
                                    to={`/rooms/${room.slug}`}
                                    onClick={onRoomSelect}
                                    className={cn(
                                        "group flex items-center gap-3.5 rounded-2xl p-3.5 transition-all duration-300 w-full max-w-[calc(100vw-2rem)] sm:max-w-none relative overflow-hidden",
                                        isActive
                                            ? "bg-violet-600/10 border border-violet-500/20 shadow-[inset_0_0_15px_rgba(139,92,246,0.05)]"
                                            : "hover:bg-slate-800/40 border border-transparent hover:border-white/5 bg-slate-950/20"
                                    )}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-violet-500 rounded-r-full shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
                                    )}
                                    <div
                                        className={cn(
                                            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl transition-all duration-500",
                                            isActive
                                                ? "bg-gradient-to-br from-violet-600 to-sky-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)] ring-1 ring-white/10"
                                                : "bg-slate-800/80 text-slate-400 group-hover:text-white group-hover:bg-slate-700/80 border border-white/5"
                                        )}
                                    >
                                        {room.icon || <Hash className="h-5 w-5" />}
                                    </div>

                                    <div className="flex-1 min-w-0 pr-1">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <h3
                                                className={cn(
                                                    "truncate text-[15px] font-semibold tracking-tight transition-colors",
                                                    isActive ? "text-violet-100" : "text-slate-200 group-hover:text-white"
                                                )}
                                            >
                                                {room.name}
                                            </h3>
                                            {room.unreadCount ? (
                                                <span className="flex items-center justify-center min-w-[1.5rem] h-5 rounded-full bg-violet-500 px-1.5 text-[10px] font-bold text-white shadow-[0_0_10px_rgba(139,92,246,0.4)]">
                                                    {room.unreadCount > 99 ? "99+" : room.unreadCount}
                                                </span>
                                            ) : null}
                                        </div>
                                        <p className="truncate text-[13px] text-slate-400 font-light pr-2">
                                            {room.description || "No description"}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
