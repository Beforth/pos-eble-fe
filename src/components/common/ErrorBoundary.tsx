import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="w-full max-w-md rounded-xl border border-line bg-card p-6 text-center">
          <p className="text-3xl">⚠</p>
          <h2 className="mt-2 text-lg font-bold text-ink">
            Something went wrong
          </h2>
          <p className="mt-1 text-sm text-muted">
            The page failed to render. If this keeps happening, check the
            browser console for details.
          </p>
          <code className="mt-3 block max-h-28 overflow-auto rounded-md bg-page px-3 py-2 text-left text-xs text-danger">
            {this.state.error.message}
          </code>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Reload
          </button>
        </div>
      </div>
    )
  }
}