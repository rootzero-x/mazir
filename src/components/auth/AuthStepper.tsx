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
        <div className="flex items-center justify-between w-full mb-8 px-4">
            {steps.map((step) => (
                <div key={step.num} className="flex flex-col items-center relative z-10">
                    <div
                        className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border mb-2",
                            currentStep >= step.num
                                ? "bg-blue-600 border-blue-600 text-white"
                                : "bg-slate-900 border-slate-700 text-slate-500"
                        )}
                    >
                        {step.num}
                    </div>
                    <span
                        className={cn(
                            "text-[10px] uppercase tracking-wider font-semibold transition-colors duration-300 absolute -bottom-6 w-32 text-center",
                            currentStep >= step.num ? "text-blue-400" : "text-slate-600"
                        )}
                    >
                        {step.label}
                    </span>
                </div>
            ))}
            {/* Progress Bar Background */}
            <div className="absolute left-0 right-0 top-4 h-0.5 bg-slate-800 -z-0 mx-8 hidden" />
        </div>
    );
}
