import { TrendingUp, Users, Award } from "lucide-react";

export default function RightPanel() {
    return (
        <aside className="hidden w-80 flex-col gap-6 overflow-y-auto border-l border-white/5 bg-slate-950/40 backdrop-blur-2xl shadow-[-8px_0_32px_rgba(0,0,0,0.3)] p-6 xl:flex h-screen sticky top-0">

            {/* Trending Threads Placeholder */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-300 drop-shadow-sm">
                    <TrendingUp className="h-4 w-4 text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                    <h3>Trending Now</h3>
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded-xl border border-white/5 bg-slate-900/50 backdrop-blur-sm p-4 transition-all hover:bg-white/5 hover:border-white/10 hover:-translate-y-0.5 shadow-sm cursor-pointer group">
                            <h4 className="text-sm font-medium leading-tight text-slate-200 group-hover:text-white transition-colors">
                                Optimizing React re-renders with compiler
                            </h4>
                            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                <span>24 comments</span>
                                <span>•</span>
                                <span>2h ago</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Active Rooms Placeholder */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-300 drop-shadow-sm">
                    <Users className="h-4 w-4 text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
                    <h3>Active Rooms</h3>
                </div>
                <div className="space-y-2">
                    {["Frontend", "System Design", "Career Growth"].map((room) => (
                        <div key={room} className="flex items-center justify-between rounded-xl border border-transparent p-2.5 hover:bg-white/5 hover:border-white/5 cursor-pointer transition-all">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                <span className="text-sm font-medium">{room}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">120+</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Top Contributors Placeholder */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-300 drop-shadow-sm">
                    <Award className="h-4 w-4 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                    <h3>Top Contributors</h3>
                </div>
                <div className="flex -space-x-3 pl-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-10 w-10 rounded-full bg-slate-800 border-2 border-slate-950 flex items-center justify-center text-xs font-bold text-slate-300 shadow-md ring-1 ring-white/10 hover:z-10 hover:-translate-y-1 transition-transform cursor-pointer">
                            U{i}
                        </div>
                    ))}
                </div>
            </section>

        </aside>
    );
}
