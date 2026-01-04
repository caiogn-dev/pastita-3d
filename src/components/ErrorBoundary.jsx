import React from 'react';

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
    
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={containerStyle}>
          <div style={cardStyle}>
            <div style={iconContainerStyle}>
              <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            
            <h1 style={titleStyle}>Ops! Algo deu errado</h1>
            <p style={subtitleStyle}>
              Ocorreu um erro inesperado. Por favor, tente novamente.
            </p>
            
            {import.meta.env.DEV && this.state.error && (
              <div style={errorDetailsStyle}>
                <p style={errorTextStyle}>{this.state.error.toString()}</p>
              </div>
            )}

            <div style={buttonContainerStyle}>
              <button onClick={this.handleReload} style={primaryButtonStyle}>
                Tentar Novamente
              </button>
              <button onClick={this.handleGoHome} style={secondaryButtonStyle}>
                Voltar ao Início
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const containerStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#FDFBF7',
  padding: '20px',
};

const cardStyle = {
  backgroundColor: '#fff',
  borderRadius: '16px',
  padding: '50px 40px',
  maxWidth: '500px',
  width: '100%',
  textAlign: 'center',
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
};

const iconContainerStyle = {
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  backgroundColor: '#fee2e2',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 24px',
};

const iconStyle = {
  width: '40px',
  height: '40px',
  color: '#dc2626',
};

const titleStyle = {
  fontSize: '2rem',
  color: '#722F37',
  marginBottom: '12px',
  fontWeight: '700',
};

const subtitleStyle = {
  fontSize: '1.1rem',
  color: '#666',
  marginBottom: '24px',
};

const errorDetailsStyle = {
  backgroundColor: '#f8f8f8',
  padding: '16px',
  borderRadius: '8px',
  marginBottom: '24px',
  textAlign: 'left',
  overflow: 'auto',
  maxHeight: '150px',
};

const errorTextStyle = {
  fontSize: '0.85rem',
  color: '#dc2626',
  fontFamily: 'monospace',
  margin: 0,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
};

const buttonContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const primaryButtonStyle = {
  backgroundColor: '#722F37',
  color: '#fff',
  padding: '14px 24px',
  borderRadius: '8px',
  border: 'none',
  fontWeight: '600',
  fontSize: '1rem',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
};

const secondaryButtonStyle = {
  backgroundColor: 'transparent',
  color: '#722F37',
  padding: '14px 24px',
  borderRadius: '8px',
  border: '2px solid #722F37',
  fontWeight: '600',
  fontSize: '1rem',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
};

export default ErrorBoundary;
