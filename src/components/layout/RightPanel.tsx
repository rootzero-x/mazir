import { TrendingUp, Users, Award } from "lucide-react";

export default function RightPanel() {
    return (
        <aside className="hidden w-80 flex-col gap-6 overflow-y-auto border-l border-border bg-card/20 p-6 xl:flex h-screen sticky top-0">

            {/* Trending Threads Placeholder */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <h3>Trending Now</h3>
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded-xl border border-border bg-card p-3 transition-colors hover:bg-card/80 cursor-pointer">
                            <h4 className="text-sm font-medium leading-tight">
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
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <h3>Active Rooms</h3>
                </div>
                <div className="space-y-2">
                    {["Frontend", "System Design", "Career Growth"].map((room) => (
                        <div key={room} className="flex items-center justify-between rounded-lg p-2 hover:bg-white/5 cursor-pointer">
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
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <Award className="h-4 w-4" />
                    <h3>Top Contributors</h3>
                </div>
                <div className="flex -space-x-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-8 w-8 rounded-full bg-slate-700 border-2 border-background flex items-center justify-center text-xs">
                            U{i}
                        </div>
                    ))}
                </div>
            </section>

        </aside>
    );
}
