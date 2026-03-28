import { Button } from "@toss/tds-mobile";
import type { CSSProperties } from "react";
import { Layout } from "@components/Layout";

const SPACING = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

const styles = {
  hero: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  } satisfies CSSProperties,
  heading: {
    fontSize: 26,
    fontWeight: 700,
    lineHeight: "34px",
    color: "#191f28",
    margin: 0,
  } satisfies CSSProperties,
  description: {
    fontSize: 16,
    lineHeight: "24px",
    color: "#8b95a1",
    marginTop: SPACING.sm,
  } satisfies CSSProperties,
  divider: {
    height: 1,
    backgroundColor: "#e5e8eb",
    margin: `${SPACING.md}px 0`,
  } satisfies CSSProperties,
  section: {
    paddingTop: SPACING.md,
  } satisfies CSSProperties,
  sectionTitle: {
    fontSize: 22,
    fontWeight: 700,
    lineHeight: "30px",
    color: "#191f28",
    marginBottom: SPACING.sm,
  } satisfies CSSProperties,
  sectionDesc: {
    fontSize: 14,
    lineHeight: "20px",
    color: "#8b95a1",
    marginBottom: SPACING.lg,
  } satisfies CSSProperties,
  buttonGap: {
    height: SPACING.sm,
  } satisfies CSSProperties,
};

interface HomePageProps {
  onNavigate: (page: "detail", params?: Record<string, string>) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <Layout>
      <div style={styles.hero}>
        <h1 style={styles.heading}>환영합니다</h1>
        <p style={styles.description}>
          토스 앱 내에서 동작하는 미니앱을 빠르게 만들어 보세요.
        </p>
      </div>

      <div style={styles.divider} />

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>시작하기</h2>
        <p style={styles.sectionDesc}>
          아래 버튼을 눌러 상세 화면으로 이동해 보세요.
        </p>

        <Button
          color="primary"
          variant="fill"
          size="large"
          display="full"
          onClick={() => onNavigate("detail", { id: "1" })}
        >
          상세 화면으로 이동
        </Button>

        <div style={styles.buttonGap} />

        <Button
          color="dark"
          variant="weak"
          size="large"
          display="full"
          onClick={() => onNavigate("detail", { id: "2" })}
        >
          다른 항목 보기
        </Button>
      </div>
    </Layout>
  );
}
