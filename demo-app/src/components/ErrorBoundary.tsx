import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary caught an error:', error);
    console.error('Error details:', errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          border: '2px solid red', 
          borderRadius: '8px', 
          backgroundColor: '#fff5f5',
          margin: '20px 0'
        }}>
          <h2 style={{ color: 'red', marginBottom: '10px' }}>🚨 React Error Caught!</h2>
          <details style={{ marginBottom: '15px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Error Details</summary>
            <div style={{ marginTop: '10px', fontFamily: 'monospace', fontSize: '12px' }}>
              <div><strong>Error:</strong> {this.state.error?.message}</div>
              <div style={{ marginTop: '10px' }}><strong>Stack:</strong></div>
              <pre style={{ backgroundColor: '#f8f8f8', padding: '10px', overflow: 'auto' }}>
                {this.state.error?.stack}
              </pre>
              {this.state.errorInfo && (
                <>
                  <div style={{ marginTop: '10px' }}><strong>Component Stack:</strong></div>
                  <pre style={{ backgroundColor: '#f8f8f8', padding: '10px', overflow: 'auto' }}>
                    {this.state.errorInfo.componentStack}
                  </pre>
                </>
              )}
            </div>
          </details>
          <button 
            onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#dc2626', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;