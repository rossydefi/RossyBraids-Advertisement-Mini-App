import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State {
  failed: boolean;
}

/** Keeps a crash in one screen from blanking the whole app. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('UI error:', error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="min-h-screen bg-[#140D08] text-[#FAF6F0] flex flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="font-cinzel text-2xl text-[#F5E6A3]">Something went wrong</h1>
        <p className="max-w-md text-sm text-[#DFCEBC]">
          Sorry about that. Please reload the page. If it keeps happening, message us on WhatsApp.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-5 py-2 rounded-full bg-[#D4AF37] text-[#2A1810] font-bold text-sm cursor-pointer"
        >
          Reload
        </button>
      </div>
    );
  }
}
