import { useReveal } from '../lib/hooks.js';

// Headline whose lines slide up from behind a mask, one after another.
export default function Lines({ as: Tag = 'h2', lines, className = '', delay = 0 }) {
  const ref = useReveal({ threshold: 0.2 });
  return (
    <Tag ref={ref} className={`lines ${className}`}>
      {lines.map((l, i) => (
        <span className="ln" key={i}><span className="ln-in" style={{ '--d': `${delay + i * 110}ms` }}>{l}</span></span>
      ))}
    </Tag>
  );
}
