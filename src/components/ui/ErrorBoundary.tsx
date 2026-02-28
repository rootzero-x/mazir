import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-950 p-6 text-center relative overflow-hidden">
                    {/* Ambient Glows */}
                    <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-red-600/10 blur-[120px] pointer-events-none z-0 mix-blend-screen" />
                    <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-violet-600/10 blur-[100px] pointer-events-none z-0 mix-blend-screen" />

                    <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 p-10 rounded-[2.5rem] shadow-[0_8px_32px_rgba(0,0,0,0.4)] max-w-lg w-full relative z-10 flex flex-col items-center animate-in zoom-in-95 duration-500">
                        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-red-500/10 text-red-500 ring-1 ring-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)] relative">
                            <div className="absolute inset-0 rounded-full animate-ping bg-red-500/10 opacity-50"></div>
                            <AlertTriangle className="h-12 w-12 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)] relative z-10" />
                        </div>
                        <h1 className="mb-3 text-3xl font-bold tracking-tight text-white drop-shadow-sm">
                            System Failure
                        </h1>
                        <p className="mb-8 max-w-md text-[15px] font-light text-slate-400">
                            We encountered an unexpected error. Our engineering team has been automatically notified.
                            <br />
                            <span className="font-mono text-[13px] text-red-400/80 mt-4 block bg-slate-950/60 p-3 rounded-xl border border-red-900/30 overflow-auto max-h-32 shadow-inner text-left mx-auto max-w-sm">
                                {this.state.error?.message}
                            </span>
                        </p>
                        <div className="flex gap-4 w-full justify-center">
                            <Button
                                onClick={() => window.location.reload()}
                                className="gap-2 bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)] border-0 h-12 px-6 rounded-xl hover:-translate-y-0.5"
                            >
                                <RefreshCcw className="h-4 w-4" /> Restart App
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => window.location.href = "/feed"}
                                className="gap-2 border-white/10 bg-slate-950/50 text-slate-300 hover:text-white hover:border-violet-500/50 hover:bg-violet-600/20 h-12 px-6 rounded-xl shadow-inner"
                            >
                                <Home className="h-4 w-4" /> Home
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
