import React from 'react';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-gray-900 bg-opacity-80 rounded-xl shadow-2xl border border-red-400 text-center">
          <p className="text-red-400 text-lg font-semibold">
            Something went wrong: {this.state.error?.message || 'Unknown error'}
          </p>
          <p className="text-gray-300 mt-2">
            Please try refreshing the page or selecting different stops.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;