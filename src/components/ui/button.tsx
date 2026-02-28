import * as React from "react"
// import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Note: Radix Slot is not installed, so I'll emulate it or remove it.  
// Plan didn't explicitly mention Radix but it's common. I'll stick to simple button for now to avoid install if not needed.
// Actually, I'll just use a standard button without Slot for simplicity unless I install @radix-ui/react-slot.
// I'll skip Slot for now.

const buttonVariants = (variant: ButtonProps["variant"] = "default", size: ButtonProps["size"] = "default", className?: string) => {
    const variants: Record<string, string> = {
        default: "bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] hover:bg-violet-500 border-0 hover:-translate-y-0.5",
        destructive: "bg-red-500/90 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] hover:bg-red-500 border-0 hover:-translate-y-0.5",
        outline: "border border-white/10 bg-slate-950/50 text-slate-300 hover:text-white hover:border-violet-500/50 hover:bg-violet-600/20 shadow-inner",
        secondary: "bg-slate-800 border border-white/5 text-white shadow-sm hover:bg-slate-700",
        ghost: "text-slate-300 hover:text-white hover:bg-violet-500/20",
        link: "text-violet-400 underline-offset-4 hover:underline drop-shadow-[0_0_8px_rgba(139,92,246,0.3)]",
    }
    const sizes: Record<string, string> = {
        default: "h-12 px-5 py-2",
        sm: "h-10 rounded-lg px-4 text-xs",
        lg: "h-14 rounded-[1.25rem] px-8 text-base",
        icon: "h-12 w-12",
    }
    return cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50 disabled:pointer-events-none disabled:opacity-50",
        variants[variant || "default"],
        sizes[size || "default"],
        className
    )
}

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    size?: "default" | "sm" | "lg" | "icon"
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants(variant, size, className))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
