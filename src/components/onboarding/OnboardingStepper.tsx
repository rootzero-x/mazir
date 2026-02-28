interface OnboardingStepperProps {
    currentStep: number;
}

const steps = [
    { number: 1, title: "Profile Setup" },
    { number: 2, title: "Community Rules" },
    { number: 3, title: "Select Rooms" },
];

export default function OnboardingStepper({ currentStep }: OnboardingStepperProps) {
    return (
        <div className="w-full space-y-4">
            <div className="relative">
                <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden shadow-inner">
                    <div
                        className="h-full bg-gradient-to-r from-violet-600 to-sky-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(139,92,246,0.6)]"
                        style={{ width: `${(currentStep / 3) * 100}%` }}
                    />
                </div>
            </div>

            {/* Steps */}
            <div className="flex items-center justify-between">
                {steps.map((step) => (
                    <div
                        key={step.number}
                        className="flex flex-col items-center space-y-2"
                    >
                        <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-all shadow-inner ${step.number < currentStep
                                ? "bg-violet-600 border-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.6)]"
                                : step.number === currentStep
                                    ? "bg-violet-600 border-violet-500 text-white ring-4 ring-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.6)]"
                                    : "bg-slate-900 border-white/10 text-slate-500 backdrop-blur-md"
                                }`}
                        >
                            {step.number < currentStep ? (
                                <svg className="h-5 w-5 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                step.number
                            )}
                        </div>
                        <span
                            className={`text-xs font-medium transition-colors hidden sm:block ${step.number <= currentStep ? "text-white" : "text-slate-500"
                                }`}
                        >
                            {step.title}
                        </span>
                    </div>
                ))}
            </div>

            {/* Current Step Title (Mobile) */}
            <div className="text-center sm:hidden">
                <span className="text-sm font-medium text-violet-400 drop-shadow-[0_0_5px_rgba(139,92,246,0.5)]">
                    Step {currentStep}/3: {steps[currentStep - 1].title}
                </span>
            </div>
        </div>
    );
}
