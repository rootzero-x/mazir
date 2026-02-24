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
            {/* Progress Bar */}
            <div className="relative">
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500 ease-out"
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
                            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-all ${step.number < currentStep
                                    ? "bg-blue-600 border-blue-600 text-white"
                                    : step.number === currentStep
                                        ? "bg-blue-600 border-blue-600 text-white ring-4 ring-blue-600/20"
                                        : "bg-slate-900 border-slate-700 text-slate-500"
                                }`}
                        >
                            {step.number < currentStep ? (
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <span className="text-sm font-medium text-blue-400">
                    Step {currentStep}/3: {steps[currentStep - 1].title}
                </span>
            </div>
        </div>
    );
}
