export default function Marquee({ items }) {
  const row = items.map((t, i) => <span key={i} className="mq-item">{t}<span className="mq-star" aria-hidden="true">✦</span></span>);
  return (
    <div className="mq" aria-hidden="true">
      <div className="mq-track">{row}{row}</div>
    </div>
  );
}
