import type { CSSProperties, ReactNode } from 'react';

interface BottomSheetProps {
  children: ReactNode;
  description: string;
  open: boolean;
  title: string;
  onClose: () => void;
}

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.35)',
  backdropFilter: 'blur(3px)',
  zIndex: 40,
};

const sheetStyle: CSSProperties = {
  position: 'fixed',
  left: '50%',
  bottom: 0,
  width: 'min(420px, 100%)',
  transform: 'translateX(-50%)',
  border: 0,
  borderRadius: '28px 28px 0 0',
  background: '#ffffff',
  padding: '20px 20px max(24px, env(safe-area-inset-bottom, 16px))',
  boxShadow: '0 -24px 60px rgba(15, 23, 42, 0.18)',
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  zIndex: 41,
};

export function BottomSheet({ children, description, open, title, onClose }: BottomSheetProps) {
  if (!open) {
    return null;
  }

  return (
    <>
      <button aria-label="시트 닫기" type="button" style={overlayStyle} onClick={onClose} />
      <dialog open style={sheetStyle}>
        <div
          style={{
            width: 48,
            height: 5,
            borderRadius: 999,
            background: '#d1d6db',
            alignSelf: 'center',
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <strong style={{ fontSize: 20, color: '#191f28' }}>{title}</strong>
          <p style={{ color: '#6b7684', lineHeight: 1.55 }}>{description}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
      </dialog>
    </>
  );
}
