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
                <div className="space-y-2">
                    <div className="h-8 w-48 rounded-lg bg-slate-800/50 animate-pulse" />
                    <div className="h-4 w-64 rounded bg-slate-800/30 animate-pulse" />
                </div>
                <div className="h-10 w-full sm:w-72 rounded-lg bg-slate-800/50 animate-pulse" />
            </div>

            {/* Grid Skeleton */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: cardCount }).map((_, i) => (
                    <div
                        key={i}
                        className="relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/50 p-6 space-y-4"
                    >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />

                        <div className="flex items-center justify-between">
                            <div className="h-12 w-12 rounded-xl bg-slate-800/50 animate-pulse" />
                            <div className="h-4 w-20 rounded bg-slate-800/30 animate-pulse" />
                        </div>

                        <div className="space-y-2">
                            <div className="h-6 w-3/4 rounded bg-slate-800/50 animate-pulse" />
                            <div className="h-4 w-full rounded bg-slate-800/30 animate-pulse" />
                            <div className="h-4 w-2/3 rounded bg-slate-800/30 animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
