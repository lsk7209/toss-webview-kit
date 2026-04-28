import type { FortuneTopicId } from '@/features/fortune/data';
import type { SavedFortune, VisitStats } from '@/features/fortune/storage';
import { Button } from '@toss/tds-mobile';

interface CollectionPageProps {
  savedFortunes: SavedFortune[];
  stats: VisitStats;
  onOpenFortune: (fortune: SavedFortune) => void;
  onPickFortune: (topicId: FortuneTopicId) => void;
}

export function CollectionPage({
  savedFortunes,
  stats,
  onOpenFortune,
  onPickFortune,
}: CollectionPageProps) {
  return (
    <>
      <section
        style={{
          borderRadius: 32,
          padding: 24,
          background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)',
          border: '1px solid rgba(96, 165, 250, 0.18)',
        }}
      >
        <h1 style={{ fontSize: 30, lineHeight: 1.24, color: '#191f28' }}>컬렉션</h1>
        <p style={{ marginTop: 12, color: '#6b7684', lineHeight: 1.65 }}>
          저장한 결과 {savedFortunes.length}개 · 연속 방문 {stats.streakCount}일
        </p>
      </section>

      {savedFortunes.length === 0 ? (
        <section
          style={{
            borderRadius: 28,
            padding: 24,
            background: '#ffffff',
            border: '1px solid #eceff3',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <strong style={{ fontSize: 20, color: '#191f28' }}>아직 모은 카드가 없어요</strong>
          <p style={{ color: '#6b7684', lineHeight: 1.6 }}>
            오늘의 흐름을 한 번 뽑고 저장하면 여기서 다시 볼 수 있어요.
          </p>
          <Button
            color="primary"
            display="full"
            size="large"
            variant="fill"
            onClick={() => onPickFortune('today')}
          >
            첫 결과 바로 만들기
          </Button>
        </section>
      ) : (
        savedFortunes.map((fortune) => (
          <button
            key={fortune.readingId}
            type="button"
            onClick={() => onOpenFortune(fortune)}
            style={{
              width: '100%',
              borderRadius: 28,
              padding: 20,
              background: '#ffffff',
              border: '1px solid #eceff3',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: fortune.accentColor }}>
              {fortune.topicLabel}
            </span>
            <strong style={{ fontSize: 21, color: '#191f28' }}>
              {fortune.catName} · {fortune.headline}
            </strong>
            <p style={{ color: '#6b7684', lineHeight: 1.6 }}>{fortune.summary}</p>
          </button>
        ))
      )}
    </>
  );
}
