import { Button } from "@toss/tds-mobile";
import type { CSSProperties } from "react";
import { Layout } from "@components/Layout";
import { shareMessage } from "@utils/share";

const SPACING = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

const styles = {
  header: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  } satisfies CSSProperties,
  title: {
    fontSize: 22,
    fontWeight: 700,
    lineHeight: "30px",
    color: "#191f28",
    margin: 0,
  } satisfies CSSProperties,
  card: {
    backgroundColor: "#f2f4f6",
    borderRadius: 12,
    padding: SPACING.lg,
    marginTop: SPACING.md,
  } satisfies CSSProperties,
  cardTitle: {
    fontSize: 16,
    fontWeight: 600,
    lineHeight: "24px",
    color: "#191f28",
    marginBottom: SPACING.sm,
  } satisfies CSSProperties,
  cardDesc: {
    fontSize: 14,
    lineHeight: "20px",
    color: "#8b95a1",
  } satisfies CSSProperties,
  actions: {
    marginTop: SPACING.xl,
    display: "flex",
    flexDirection: "column" as const,
    gap: SPACING.sm,
  } satisfies CSSProperties,
};

/** 샘플 데이터 */
const ITEMS: Record<string, { title: string; description: string }> = {
  "1": {
    title: "첫 번째 항목",
    description:
      "이것은 상세 페이지 예시입니다. 실제 앱에서는 API 데이터를 표시할 수 있습니다.",
  },
  "2": {
    title: "두 번째 항목",
    description:
      "다른 항목의 상세 정보입니다. 각 항목마다 고유한 내용을 표시합니다.",
  },
};

const DEFAULT_ITEM = {
  title: "알 수 없는 항목",
  description: "해당 항목을 찾을 수 없습니다.",
};

interface DetailPageProps {
  params?: Record<string, string>;
  onBack: () => void;
}

export function DetailPage({ params, onBack }: DetailPageProps) {
  const id = params?.id ?? "1";
  const item = ITEMS[id] ?? DEFAULT_ITEM;

  const handleShare = async () => {
    await shareMessage(`${item.title}: ${item.description}`);
  };

  return (
    <Layout>
      <div style={styles.header}>
        <h1 style={styles.title}>상세 정보</h1>
      </div>

      <div style={styles.card}>
        <p style={styles.cardTitle}>{item.title}</p>
        <p style={styles.cardDesc}>{item.description}</p>
      </div>

      <div style={styles.actions}>
        <Button
          color="primary"
          variant="fill"
          size="large"
          display="full"
          onClick={handleShare}
        >
          공유하기
        </Button>

        <Button
          color="dark"
          variant="weak"
          size="large"
          display="full"
          onClick={onBack}
        >
          돌아가기
        </Button>
      </div>
    </Layout>
  );
}
