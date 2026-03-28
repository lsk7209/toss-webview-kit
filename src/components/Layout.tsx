import type { CSSProperties, ReactNode } from "react";

const LAYOUT_PADDING = 20;

const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
  padding: `0 ${LAYOUT_PADDING}px`,
  paddingBottom: 24,
};

interface LayoutProps {
  children: ReactNode;
}

/** 공통 페이지 레이아웃 */
export function Layout({ children }: LayoutProps) {
  return <div style={containerStyle}>{children}</div>;
}
