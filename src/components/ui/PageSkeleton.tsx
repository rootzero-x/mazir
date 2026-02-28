import { cn } from "@/lib/utils";

interface PageSkeletonProps {
    className?: string;
    cardCount?: number;
}

export default function PageSkeleton({ className, cardCount = 6 }: PageSkeletonProps) {
    return (
        <div className={cn("space-y-6 w-full animate-in fade-in duration-500", className)}>
            {/* Header Skeleton */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-3">
                    <div className="h-9 w-56 rounded-xl bg-white/5 animate-pulse shadow-inner border border-white/5" />
                    <div className="h-4 w-72 rounded-md bg-white/5 animate-pulse" />
                </div>
                <div className="h-12 w-full sm:w-64 rounded-xl bg-white/5 animate-pulse shadow-inner border border-white/5" />
            </div>

            {/* Grid Skeleton */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: cardCount }).map((_, i) => (
                    <div
                        key={i}
                        className="relative overflow-hidden rounded-[1.5rem] border border-white/5 bg-slate-900/40 p-6 space-y-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
                    >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-violet-500/5 to-transparent z-10" />

                        <div className="flex items-center justify-between">
                            <div className="h-14 w-14 rounded-[1rem] bg-white/5 animate-pulse shadow-inner border border-white/5" />
                            <div className="h-5 w-24 rounded-full bg-white/5 animate-pulse border border-white/5" />
                        </div>

                        <div className="space-y-3">
                            <div className="h-7 w-3/4 rounded-md bg-white/5 animate-pulse" />
                            <div className="h-4 w-full rounded-md bg-white/5 animate-pulse opacity-70" />
                            <div className="h-4 w-2/3 rounded-md bg-white/5 animate-pulse opacity-70" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
