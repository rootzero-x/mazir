"use client"

import * as React from "react"
import { Listbox, Transition } from "@headlessui/react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const Select = ({ value, onValueChange, children }: any) => {
    return (
        <Listbox value={value} onChange={onValueChange}>
            <div className="relative mt-1">
                {children}
            </div>
        </Listbox>
    )
}

const SelectTrigger = ({ className, children, ...props }: any) => {
    return (
        <Listbox.Button
            className={cn(
                "relative w-full cursor-default rounded-xl bg-slate-950/50 py-3 pl-4 pr-10 text-left shadow-inner focus:outline-none sm:text-sm border border-white/5 text-slate-200 focus-visible:ring-1 focus-visible:ring-violet-500/50 focus:border-violet-500/50 transition-all",
                className
            )}
            {...props}
        >
            <span className="block truncate">{children}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
        </Listbox.Button>
    )
}

const SelectValue = ({ placeholder }: any) => {
    // Basic placeholder display for now
    return <span className="block truncate">{placeholder || "Select..."}</span>;
}

const SelectContent = ({ className, children, ...props }: any) => (
    <Transition
        as={React.Fragment}
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
    >
        <Listbox.Options
            className={cn(
                "absolute mt-2 max-h-60 w-full overflow-auto rounded-xl bg-slate-900/90 py-1.5 text-base shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl ring-1 ring-white/10 focus:outline-none sm:text-sm border border-white/5 z-50",
                className
            )}
            {...props}
        >
            {children}
        </Listbox.Options>
    </Transition>
)

const SelectItem = ({ value, children, className, ...props }: any) => (
    <Listbox.Option
        className={({ active }) =>
            cn(
                "relative cursor-default select-none py-2.5 pl-10 pr-4 transition-colors",
                active ? "bg-violet-600/20 text-white" : "text-slate-300",
                className
            )
        }
        value={value}
        {...props}
    >
        {({ selected }) => (
            <>
                <span className={cn("block truncate", selected ? "font-medium text-white" : "font-normal")}>
                    {children}
                </span>
                {selected ? (
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]">
                        <Check className="h-4 w-4" aria-hidden="true" />
                    </span>
                ) : null}
            </>
        )}
    </Listbox.Option>
)

export { Select, SelectValue, SelectTrigger, SelectContent, SelectItem }
