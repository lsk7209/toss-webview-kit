import type { CSSProperties, ReactNode } from 'react';

const containerStyle: CSSProperties = {
  width: '100%',
  maxWidth: 420,
  margin: '0 auto',
  padding: '24px 18px max(28px, env(safe-area-inset-bottom, 20px))',
  display: 'flex',
  flexDirection: 'column',
  gap: 18,
};

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return <main style={containerStyle}>{children}</main>;
}
