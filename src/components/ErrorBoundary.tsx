import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

const styles = {
  button: {
    padding: '12px 24px',
    backgroundColor: '#f97316',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
  },
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '0 24px',
    textAlign: 'center' as const,
  },
  description: {
    fontSize: 14,
    color: '#6b7684',
    lineHeight: '22px',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: '#191f28',
    marginBottom: 10,
  },
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {}

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={styles.container}>
          <p style={styles.title}>잠시 문제가 생겼어요</p>
          <p style={styles.description}>다시 시도하면 대부분 바로 복구돼요.</p>
          <button type="button" style={styles.button} onClick={this.handleRetry}>
            다시 시도해요
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
