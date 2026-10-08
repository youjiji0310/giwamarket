import { useEffect, useRef } from 'react';

// Soft trailing ring on desktop pointers only.
export default function Cursor() {
  const ring = useRef(null);
  useEffect(() => {
    if (!matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = ring.current;
    el.style.display = 'block';
    let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, raf;
    const move = e => { tx = e.clientX; ty = e.clientY; };
    const over = e => el.classList.toggle('is-hover', !!e.target.closest('a, button, [data-hover]'));
    const loop = () => {
      x += (tx - x) * 0.18; y += (ty - y) * 0.18;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    addEventListener('mousemove', move); addEventListener('mouseover', over); loop();
    return () => { removeEventListener('mousemove', move); removeEventListener('mouseover', over); cancelAnimationFrame(raf); };
  }, []);
  return <div ref={ring} className="cursor" aria-hidden="true" />;
}
