import type { DebugEvent } from '@/features/analytics/useAnalytics';
import type { CSSProperties } from 'react';

interface DebugPanelProps {
  currentPage: string;
  events: DebugEvent[];
  isInterstitialReady: boolean;
  isRewardReady: boolean;
  isSandbox: boolean;
  sessionAdCount: number;
  onSimulateBack: () => void;
}

const panelStyle: CSSProperties = {
  position: 'fixed',
  right: 12,
  top: 12,
  width: 'min(360px, calc(100vw - 24px))',
  borderRadius: 22,
  background: 'rgba(15, 23, 42, 0.92)',
  color: '#f8fafc',
  padding: 16,
  boxShadow: '0 20px 50px rgba(15, 23, 42, 0.35)',
  zIndex: 60,
};

export function DebugPanel({
  currentPage,
  events,
  isInterstitialReady,
  isRewardReady,
  isSandbox,
  sessionAdCount,
  onSimulateBack,
}: DebugPanelProps) {
  return (
    <aside style={panelStyle}>
      <strong style={{ display: 'block', marginBottom: 10 }}>개발 검증 패널</strong>
      <p style={{ fontSize: 13, lineHeight: 1.55, color: '#cbd5e1' }}>
        현재 화면: {currentPage} · 환경: {isSandbox ? 'sandbox' : '브라우저'}
      </p>
      <p style={{ fontSize: 13, lineHeight: 1.55, color: '#cbd5e1' }}>
        전면 광고 준비: {isInterstitialReady ? '완료' : '대기'} · 리워드 준비:{' '}
        {isRewardReady ? '완료' : '대기'} · 노출 수: {sessionAdCount}
      </p>
      <button
        type="button"
        onClick={onSimulateBack}
        style={{
          width: '100%',
          marginTop: 12,
          border: 0,
          borderRadius: 14,
          padding: '12px 14px',
          background: '#f97316',
          color: '#ffffff',
          fontWeight: 700,
        }}
      >
        뒤로가기 시뮬레이션
      </button>
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {events.slice(0, 4).map((event, index) => (
          <div
            key={`${event.name}-${event.at}-${index}`}
            style={{
              borderRadius: 14,
              background: 'rgba(148, 163, 184, 0.18)',
              padding: '10px 12px',
            }}
          >
            <strong style={{ display: 'block', fontSize: 13 }}>{event.name}</strong>
            <span style={{ display: 'block', fontSize: 12, color: '#cbd5e1' }}>
              {new Date(event.at).toLocaleTimeString('ko-KR')}
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
}
