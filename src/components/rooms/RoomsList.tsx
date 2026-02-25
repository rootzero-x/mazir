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
        <div className="flex h-full flex-col bg-slate-950/50 border-r border-slate-800/50">
            {/* Header / Search */}
            <div className="p-4 pt-[calc(env(safe-area-inset-top,0px)+1rem)] border-b border-slate-800/50 space-y-4">
                <h2 className="text-lg font-bold text-white px-2">Communities</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <Input
                        placeholder="Search rooms..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-slate-900 border-slate-700 focus:border-blue-500/50 h-9"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-800">
                {rooms.length === 0 ? (
                    <div className="flex h-40 flex-col items-center justify-center text-center p-4">
                        <p className="text-sm text-slate-400">No rooms found.</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {filteredRooms.map((room) => {
                            const isActive = currentSlug === room.slug;
                            return (
                                <Link
                                    key={room.slug}
                                    to={`/rooms/${room.slug}`}
                                    onClick={onRoomSelect}
                                    className={cn(
                                        "group flex items-center gap-3 rounded-xl p-3 transition-all",
                                        isActive
                                            ? "bg-blue-600/10 border border-blue-600/20"
                                            : "hover:bg-slate-800/40 border border-transparent"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg transition-colors",
                                            isActive
                                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                                : "bg-slate-800 text-slate-400 group-hover:text-blue-400"
                                        )}
                                    >
                                        {room.icon || <Hash className="h-5 w-5" />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3
                                                className={cn(
                                                    "truncate text-sm font-semibold",
                                                    isActive ? "text-blue-100" : "text-slate-200"
                                                )}
                                            >
                                                {room.name}
                                            </h3>
                                            {room.unreadCount ? (
                                                <span className="flex items-center justify-center min-w-[1.25rem] h-5 rounded-full bg-blue-500 px-1.5 text-[10px] font-bold text-white">
                                                    {room.unreadCount > 99 ? "99+" : room.unreadCount}
                                                </span>
                                            ) : null}
                                        </div>
                                        <p className="truncate text-xs text-slate-500 mt-0.5">
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
