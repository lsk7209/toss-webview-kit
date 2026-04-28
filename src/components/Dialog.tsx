import type { CSSProperties } from 'react';

interface DialogProps {
  cancelLabel?: string;
  confirmLabel: string;
  description: string;
  open: boolean;
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.38)',
  backdropFilter: 'blur(4px)',
  zIndex: 50,
};

const panelStyle: CSSProperties = {
  position: 'fixed',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  width: 'min(360px, calc(100vw - 32px))',
  border: 0,
  borderRadius: 26,
  background: '#ffffff',
  padding: 24,
  boxShadow: '0 24px 80px rgba(15, 23, 42, 0.2)',
  zIndex: 51,
};

export function Dialog({
  cancelLabel = '계속 볼게요',
  confirmLabel,
  description,
  open,
  title,
  onCancel,
  onConfirm,
}: DialogProps) {
  if (!open) {
    return null;
  }

  return (
    <>
      <button type="button" style={overlayStyle} aria-label="닫기" onClick={onCancel} />
      <dialog open style={panelStyle}>
        <strong style={{ display: 'block', color: '#191f28', fontSize: 20 }}>{title}</strong>
        <p style={{ marginTop: 10, color: '#6b7684', lineHeight: 1.6 }}>{description}</p>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              borderRadius: 16,
              border: '1px solid #d1d6db',
              background: '#ffffff',
              color: '#191f28',
              padding: '13px 14px',
              fontWeight: 700,
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              flex: 1,
              borderRadius: 16,
              border: 0,
              background: '#f97316',
              color: '#ffffff',
              padding: '13px 14px',
              fontWeight: 700,
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </dialog>
    </>
  );
}
