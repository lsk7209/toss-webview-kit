interface DevAdModalProps {
  format: 'interstitial' | 'rewarded';
  open: boolean;
  placementId: string;
  onClickAd: () => void;
  onClose: () => void;
  onRewardAndClose: () => void;
}

export function DevAdModal({
  format,
  open,
  placementId,
  onClickAd,
  onClose,
  onRewardAndClose,
}: DevAdModalProps) {
  if (!open) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        aria-label="광고 닫기"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          border: 0,
          background: 'rgba(15, 23, 42, 0.5)',
          zIndex: 54,
        }}
      />
      <dialog
        open
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(360px, calc(100vw - 32px))',
          border: 0,
          borderRadius: 28,
          background: '#ffffff',
          padding: 24,
          boxShadow: '0 24px 80px rgba(15, 23, 42, 0.24)',
          zIndex: 55,
        }}
      >
        <strong style={{ display: 'block', fontSize: 20, color: '#191f28' }}>
          개발용 광고 오버레이
        </strong>
        <p style={{ marginTop: 12, color: '#6b7684', lineHeight: 1.6 }}>
          브라우저 검증 환경에서는 실제 SDK 대신 오버레이로 흐름을 확인해요.
        </p>
        <p style={{ marginTop: 10, color: '#191f28', fontWeight: 700 }}>
          {format === 'rewarded' ? '리워드 광고' : '전면 광고'} · {placementId}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
          <button
            type="button"
            onClick={onClickAd}
            style={{
              width: '100%',
              borderRadius: 16,
              border: '1px solid #d1d6db',
              background: '#ffffff',
              padding: '13px 14px',
              fontWeight: 700,
            }}
          >
            광고 클릭 로그 남기기
          </button>
          {format === 'rewarded' ? (
            <button
              type="button"
              onClick={onRewardAndClose}
              style={{
                width: '100%',
                borderRadius: 16,
                border: 0,
                background: '#f97316',
                color: '#ffffff',
                padding: '13px 14px',
                fontWeight: 700,
              }}
            >
              보상 받고 닫기
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              style={{
                width: '100%',
                borderRadius: 16,
                border: 0,
                background: '#f97316',
                color: '#ffffff',
                padding: '13px 14px',
                fontWeight: 700,
              }}
            >
              광고 닫기
            </button>
          )}
        </div>
      </dialog>
    </>
  );
}
