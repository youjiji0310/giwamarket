import { useEffect, useRef } from 'react';

// Trailing ring; grows on links and shows a label over [data-cursor] elements.
export default function Cursor() {
  const ring = useRef(null);
  const label = useRef(null);
  useEffect(() => {
    if (!matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = ring.current;
    el.style.display = 'grid';
    let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, raf;
    const move = e => { tx = e.clientX; ty = e.clientY; };
    const over = e => {
      const tag = e.target.closest('[data-cursor]');
      const link = e.target.closest('a, button');
      el.classList.toggle('is-label', !!tag);
      el.classList.toggle('is-hover', !tag && !!link);
      label.current.textContent = tag ? tag.dataset.cursor : '';
    };
    const loop = () => {
      x += (tx - x) * 0.16; y += (ty - y) * 0.16;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    addEventListener('mousemove', move); addEventListener('mouseover', over); loop();
    return () => { removeEventListener('mousemove', move); removeEventListener('mouseover', over); cancelAnimationFrame(raf); };
  }, []);
  return <div ref={ring} className="cursor" aria-hidden="true"><span ref={label} /></div>;
}
