import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error | null }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error || null} />;
      }
      
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="text-6xl mb-4">🤖</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Oops! Something went a little silly!</h2>
          <p className="text-slate-500 mb-2 max-w-md">Don't worry — even the best inventors run into glitches sometimes! Our robot friends tripped over a bug, but we can try again.</p>
          <p className="text-slate-400 text-sm mb-6">If this keeps happening, tell a grown-up so they can help fix it.</p>
          <button 
            className="px-6 py-3 bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-bold rounded-xl hover:from-violet-600 hover:to-indigo-600 transition-all shadow-lg hover:shadow-xl active:scale-95"
            onClick={() => this.setState({ hasError: false, error: undefined })}
          >
            🔄 Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;