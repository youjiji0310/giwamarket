import { useRef } from 'react';

// Pulls its child toward the pointer a little, then springs back.
export default function Magnetic({ children, strength = 0.28 }) {
  const ref = useRef(null);
  const move = e => {
    if (!matchMedia('(pointer: fine)').matches) return;
    const el = ref.current, r = el.getBoundingClientRect();
    el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * strength}px, ${(e.clientY - r.top - r.height / 2) * strength}px)`;
  };
  const leave = () => { ref.current.style.transform = ''; };
  return <span ref={ref} className="magnetic" onMouseMove={move} onMouseLeave={leave}>{children}</span>;
}
