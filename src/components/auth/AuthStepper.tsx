import { cn } from "@/lib/utils";

interface AuthStepperProps {
    currentStep: 1 | 2 | 3;
}

export default function AuthStepper({ currentStep }: AuthStepperProps) {
    const steps = [
        { num: 1, label: "Access Gate" },
        { num: 2, label: "Create Account" },
        { num: 3, label: "Verify Email" },
    ];

    return (
        <div className="flex items-center justify-between w-full mb-8 px-4 relative">
            {steps.map((step) => (
                <div key={step.num} className="flex flex-col items-center relative z-10">
                    <div
                        className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border mb-2 shadow-inner",
                            currentStep >= step.num
                                ? "bg-violet-600 border-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.6)]"
                                : "bg-slate-900 border-white/10 text-slate-500 backdrop-blur-md"
                        )}
                    >
                        {step.num}
                    </div>
                    <span
                        className={cn(
                            "text-[10px] uppercase tracking-wider font-semibold transition-colors duration-300 absolute -bottom-6 w-32 text-center",
                            currentStep >= step.num ? "text-violet-400 drop-shadow-[0_0_5px_rgba(139,92,246,0.5)]" : "text-slate-600"
                        )}
                    >
                        {step.label}
                    </span>
                </div>
            ))}
            {/* Progress Bar Background */}
            <div className="absolute left-[10%] right-[10%] top-4 h-[2px] bg-slate-800/50 -z-0" />
            <div
                className="absolute left-[10%] top-4 h-[2px] bg-violet-600/50 shadow-[0_0_10px_rgba(139,92,246,0.5)] transition-all duration-500 -z-0"
                style={{ width: currentStep === 1 ? '10%' : currentStep === 2 ? '50%' : '90%' }}
            />
        </div>
    );
}
