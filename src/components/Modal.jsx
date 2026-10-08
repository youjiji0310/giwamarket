import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { IClose } from './Icons.jsx';

export default function Modal({ open, onClose, title, children, width = 480 }) {
  const box = useRef(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement;
    const key = e => { if (e.key === 'Escape') onClose(); };
    addEventListener('keydown', key);
    box.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => { removeEventListener('keydown', key); document.body.style.overflow = ''; prev?.focus?.(); };
  }, [open]);
  if (!open) return null;
  return createPortal(
    <div className="modal-back" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={box} style={{ maxWidth: width }}>
        <div className="modal-head">
          <h2 className="modal-title">{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><IClose /></button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
