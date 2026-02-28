import * as React from "react"
import { cn } from "@/lib/utils"

export interface CheckboxProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, label, onCheckedChange, ...props }, ref) => {
        return (
            <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    className={cn(
                        "peer h-5 w-5 rounded border border-white/10 bg-slate-950/50 text-violet-500 shadow-inner focus:ring-2 focus:ring-violet-500/50 focus:ring-offset-0 cursor-pointer transition-all hover:border-violet-500/50",
                        className
                    )}
                    ref={ref}
                    onChange={(e) => {
                        props.onChange?.(e)
                        onCheckedChange?.(e.target.checked)
                    }}
                    {...props}
                />
                {label && (
                    <label className="text-[15px] font-medium leading-none cursor-pointer select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-300 peer-checked:text-white transition-colors">
                        {label}
                    </label>
                )}
            </div>
        )
    }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
