import { FORTUNE_TOPICS, type FortuneTopicId } from '@/features/fortune/data';
import type { SavedFortune, VisitStats } from '@/features/fortune/storage';
import { Button } from '@toss/tds-mobile';

interface HomePageProps {
  latestSaved: SavedFortune | null;
  savedCount: number;
  stats: VisitStats;
  onOpenCollection: () => void;
  onOpenSavedSheet: () => void;
  onPickFortune: (topicId: FortuneTopicId) => void;
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <article
      style={{
        borderRadius: 24,
        padding: '18px 16px',
        background: '#ffffff',
        border: '1px solid rgba(255, 138, 101, 0.16)',
      }}
    >
      <span style={{ display: 'block', fontSize: 13, color: '#6b7684' }}>{label}</span>
      <strong style={{ display: 'block', marginTop: 6, fontSize: 24, color: '#191f28' }}>
        {value}
      </strong>
    </article>
  );
}

export function HomePage({
  latestSaved,
  savedCount,
  stats,
  onOpenCollection,
  onOpenSavedSheet,
  onPickFortune,
}: HomePageProps) {
  return (
    <>
      <section
        style={{
          borderRadius: 32,
          padding: 24,
          background: 'linear-gradient(135deg, #fff5f0 0%, #ffe8d9 100%)',
          border: '1px solid rgba(255, 138, 101, 0.24)',
          boxShadow: '0 16px 36px rgba(255, 138, 101, 0.14)',
        }}
      >
        <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.12em', color: '#ea580c' }}>
          NYANG TAROT
        </p>
        <h1 style={{ marginTop: 12, fontSize: 32, lineHeight: 1.2, color: '#191f28' }}>
          참치가 오늘의 흐름을
          <br />
          고양이 카드로 읽어줘요
        </h1>
        <p style={{ marginTop: 14, color: '#6b7684', lineHeight: 1.65 }}>
          첫 진입은 가볍게, 재방문은 꾸준하게 설계했어요. 결과를 본 뒤 저장하고, 필요할 때만 광고를
          열어 흐름을 끊지 않게 만들었어요.
        </p>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <StatCard label="연속 방문" value={`${stats.streakCount}일`} />
        <StatCard label="뽑은 횟수" value={`${stats.totalFortunes}회`} />
        <StatCard label="저장 결과" value={`${savedCount}개`} />
      </section>

      <section
        style={{
          borderRadius: 30,
          padding: 20,
          background: '#ffffff',
          border: '1px solid #eceff3',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <strong style={{ fontSize: 21, color: '#191f28' }}>지금 뭘 보고 싶어요?</strong>
        <p style={{ color: '#6b7684', lineHeight: 1.6 }}>
          한 번 뽑으면 바로 결과를 보고, 저장한 뒤 다시 돌아올 수 있어요.
        </p>
        {FORTUNE_TOPICS.map((topic) => (
          <Button
            key={topic.id}
            color="primary"
            display="full"
            size="large"
            variant="fill"
            onClick={() => onPickFortune(topic.id)}
          >
            {topic.label}
          </Button>
        ))}
      </section>

      <section
        style={{
          borderRadius: 30,
          padding: 20,
          background: '#ffffff',
          border: '1px solid #eceff3',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <strong style={{ fontSize: 21, color: '#191f28' }}>자주 쓰게 만드는 장치</strong>
        <p style={{ color: '#6b7684', lineHeight: 1.6 }}>
          최근 결과를 다시 열고, 모아둔 카드 흐름을 한 번에 볼 수 있게 했어요.
        </p>
        <Button color="dark" display="full" size="large" variant="weak" onClick={onOpenSavedSheet}>
          저장한 결과 다시 열기
        </Button>
        <Button color="dark" display="full" size="large" variant="weak" onClick={onOpenCollection}>
          컬렉션으로 이동하기
        </Button>
        {latestSaved ? (
          <div
            style={{
              borderRadius: 20,
              padding: 16,
              background: '#fff7ed',
              color: '#9a3412',
            }}
          >
            최근 저장 결과: {latestSaved.catName} · {latestSaved.headline}
          </div>
        ) : (
          <div
            style={{
              borderRadius: 20,
              padding: 16,
              background: '#f8fafc',
              color: '#6b7684',
            }}
          >
            아직 저장한 결과가 없어요.
          </div>
        )}
      </section>
    </>
  );
}
