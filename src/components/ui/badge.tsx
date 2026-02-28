import * as React from "react"
// import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = (variant: BadgeProps["variant"] = "default", className?: string) => {
    const variants: Record<string, string> = {
        default: "border-transparent bg-violet-600/20 text-violet-400 hover:bg-violet-600/30 shadow-[0_0_10px_rgba(139,92,246,0.1)]",
        secondary: "border-white/5 bg-slate-800/50 text-slate-300 hover:bg-slate-800",
        destructive: "border-transparent bg-red-500/20 text-red-400 hover:bg-red-500/30",
        outline: "text-slate-300 border-white/10",
    }
    return cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-md transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:ring-offset-2",
        variants[variant || "default"],
        className
    )
}

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "destructive" | "outline"
}

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants(variant, className), className)} {...props} />
    )
}

export { Badge, badgeVariants }
