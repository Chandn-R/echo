import React, { Component } from "react";
import type { ReactNode } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "../components/ui/button";
interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    resetKeys?: any[];
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props.resetKeys !== prevProps.resetKeys) {
            this.setState({ hasError: false, error: null });
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                this.props.fallback || (
                    <div className="flex items-center justify-center min-h-screen p-4">
                        <div className="max-w-md w-full p-6 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/20">
                                    <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                                </div>

                                <h2 className="text-xl font-semibold text-red-800 dark:text-red-200">
                                    Something went wrong
                                </h2>

                                <p className="text-red-600 dark:text-red-300">
                                    {this.state.error?.message ||
                                        "An unexpected error occurred"}
                                </p>

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        variant="outline"
                                        onClick={this.handleReset}
                                        className="gap-2"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        Try again
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        onClick={() =>
                                            (window.location.href = "/")
                                        }
                                        className="gap-2"
                                    >
                                        <Home className="h-4 w-4" />
                                        Go home
                                    </Button>
                                </div>

                                <div className="pt-4 text-xs text-red-500 dark:text-red-400">
                                    <details>
                                        <summary className="cursor-pointer">
                                            Technical details
                                        </summary>
                                        <pre className="mt-2 p-2 bg-white dark:bg-black rounded text-left overflow-x-auto">
                                            {this.state.error?.stack}
                                        </pre>
                                    </details>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            );
        }

        return this.props.children;
    }
}
