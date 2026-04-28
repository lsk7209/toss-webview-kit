import type { FortuneResult } from '@/features/fortune/data';
import { useAsyncCallback } from '@/hooks/useAsyncCallback';
import { shareMessage } from '@/utils/share';
import { Button } from '@toss/tds-mobile';

interface ResultPageProps {
  isSaved: boolean;
  rewardReady: boolean;
  result: FortuneResult;
  onGoHome: () => void;
  onOpenCollection: () => void;
  onSave: () => Promise<void>;
  onShowReward: () => void;
}

export function ResultPage({
  isSaved,
  rewardReady,
  result,
  onGoHome,
  onOpenCollection,
  onSave,
  onShowReward,
}: ResultPageProps) {
  const [handleSave, isSaving] = useAsyncCallback(onSave);
  const [handleShare, isSharing] = useAsyncCallback(async () => {
    await shareMessage(`냥타로 결과\n${result.catName} · ${result.headline}\n${result.summary}`);
  });

  return (
    <>
      <section
        style={{
          borderRadius: 32,
          padding: 24,
          background: 'linear-gradient(140deg, #fff7ed 0%, #ffffff 100%)',
          border: `1px solid ${result.accentColor}33`,
          boxShadow: '0 18px 48px rgba(15, 23, 42, 0.08)',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            padding: '8px 12px',
            borderRadius: 999,
            background: `${result.accentColor}18`,
            color: result.accentColor,
            fontWeight: 700,
            fontSize: 12,
          }}
        >
          {result.topicLabel}
        </span>
        <h1 style={{ marginTop: 16, fontSize: 30, lineHeight: 1.24, color: '#191f28' }}>
          {result.catName} · {result.cardName}
        </h1>
        <p style={{ marginTop: 12, fontSize: 20, color: '#191f28', fontWeight: 700 }}>
          {result.headline}
        </p>
        <p style={{ marginTop: 14, color: '#4b5563', lineHeight: 1.72 }}>{result.summary}</p>
      </section>

      <section
        style={{
          borderRadius: 28,
          padding: 20,
          background: '#ffffff',
          border: '1px solid #eceff3',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <strong style={{ fontSize: 20, color: '#191f28' }}>오늘의 한 줄 액션</strong>
        <p style={{ color: '#6b7684', lineHeight: 1.6 }}>{result.actionLabel}</p>
      </section>

      <section
        style={{
          borderRadius: 28,
          padding: 20,
          background: result.rewardUnlocked ? '#fff7ed' : '#f8fafc',
          border: '1px solid #eceff3',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <strong style={{ fontSize: 20, color: '#191f28' }}>추가 조언</strong>
        <p style={{ color: '#6b7684', lineHeight: 1.6 }}>
          {result.rewardUnlocked
            ? result.extraAdvice
            : '광고를 보고 추가 조언을 열 수 있어요. 준비가 늦어도 흐름을 막지 않고 바로 열어드려요.'}
        </p>
        {!result.rewardUnlocked && (
          <Button color="primary" display="full" size="large" variant="fill" onClick={onShowReward}>
            {rewardReady ? '광고 보고 추가 조언 열기' : '광고 준비 중이어도 바로 진행하기'}
          </Button>
        )}
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Button
          color="primary"
          display="full"
          loading={isSaving}
          size="large"
          variant="fill"
          onClick={handleSave}
        >
          {isSaved ? '이미 저장했어요' : '결과 저장하기'}
        </Button>
        <Button
          color="dark"
          display="full"
          loading={isSharing}
          size="large"
          variant="weak"
          onClick={handleShare}
        >
          결과 공유하기
        </Button>
        <Button color="dark" display="full" size="large" variant="weak" onClick={onOpenCollection}>
          컬렉션 보기
        </Button>
        <Button color="dark" display="full" size="large" variant="weak" onClick={onGoHome}>
          홈으로 돌아가기
        </Button>
      </section>
    </>
  );
}
