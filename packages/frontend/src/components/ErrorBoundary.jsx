import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled UI error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app">
          <div className="panel">
            <h1>Something went wrong</h1>
            <p className="muted">
              The voting booth ran into an unexpected error. Please refresh
              the page to start again.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
