import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error("Uncaught error intercepted by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-wrapper">
          <div className="error-card slide-in">
            <div className="error-icon-container">
              <AlertOctagon size={48} className="error-icon" />
            </div>
            <h1 className="error-title">Something went wrong</h1>
            <p className="error-message">
              The application encountered an unexpected fault and was unable to render the component. 
              Please try refreshing the page or navigating back.
            </p>
            <div className="error-actions">
              <button 
                className="btn btn-primary flex justify-center items-center gap-2"
                onClick={() => window.location.reload()}
              >
                <RefreshCw size={18} />
                <span>Reload Page</span>
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="error-details">
                <p className="error-details-summary">{this.state.error.toString()}</p>
                <pre className="error-stacktrace">
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
