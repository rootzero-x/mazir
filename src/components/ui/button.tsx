import * as React from "react"
// import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Note: Radix Slot is not installed, so I'll emulate it or remove it.  
// Plan didn't explicitly mention Radix but it's common. I'll stick to simple button for now to avoid install if not needed.
// Actually, I'll just use a standard button without Slot for simplicity unless I install @radix-ui/react-slot.
// I'll skip Slot for now.

const buttonVariants = (variant: ButtonProps["variant"] = "default", size: ButtonProps["size"] = "default", className?: string) => {
    const variants: Record<string, string> = {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-red-500 text-white shadow-sm hover:bg-red-500/90",
        outline: "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
    }
    const sizes: Record<string, string> = {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8",
        icon: "h-9 w-9",
    }
    return cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
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
