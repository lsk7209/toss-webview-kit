import { useEffect } from 'react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

export function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    if (!message) {
      return;
    }

    const timer = window.setTimeout(onClose, 2200);
    return () => window.clearTimeout(timer);
  }, [message, onClose]);

  if (!message) {
    return null;
  }

  return (
    <output
      aria-live="polite"
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 'max(18px, env(safe-area-inset-bottom, 12px))',
        transform: 'translateX(-50%)',
        background: '#111827',
        color: '#f9fafb',
        padding: '12px 16px',
        borderRadius: 999,
        fontSize: 13,
        boxShadow: '0 16px 30px rgba(15, 23, 42, 0.24)',
        zIndex: 70,
      }}
    >
      {message}
    </output>
  );
}
