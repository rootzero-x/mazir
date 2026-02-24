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
                <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-950 p-4 text-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 text-red-500 ring-1 ring-red-500/20">
                        <AlertTriangle className="h-10 w-10" />
                    </div>
                    <h1 className="mb-2 text-2xl font-bold tracking-tight text-white">
                        Something went wrong
                    </h1>
                    <p className="mb-8 max-w-md text-slate-400">
                        We encountered an unexpected error. Our team has been notified.
                        <br />
                        <span className="font-mono text-xs text-red-400 mt-2 block bg-slate-900 p-2 rounded border border-red-900/30 overflow-auto max-h-32">
                            {this.state.error?.message}
                        </span>
                    </p>
                    <div className="flex gap-4">
                        <Button
                            onClick={() => window.location.reload()}
                            className="gap-2 bg-red-600 hover:bg-red-700"
                        >
                            <RefreshCcw className="h-4 w-4" /> Reload Page
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => window.location.href = "/feed"}
                            className="gap-2 border-slate-800 text-slate-300 hover:bg-slate-900"
                        >
                            <Home className="h-4 w-4" /> Back to Home
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
