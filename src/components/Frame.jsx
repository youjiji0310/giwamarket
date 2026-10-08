import Artwork from '../lib/art.jsx';

// Museum presentation: dark mat, hairline frame, light sweep, catalogue placard.
export default function Frame({ seed, style, lot, title, meta, label, className = '' }) {
  return (
    <figure className={`frame ${className}`} data-cursor="View">
      <div className="frame-mat">
        <div className="frame-art"><Artwork seed={seed} style={style} label={label} /><span className="frame-sweep" /></div>
      </div>
      {(lot || title) && (
        <figcaption className="placard">
          {lot && <span className="placard-lot">Lot {lot}</span>}
          {title && <span className="placard-title">{title}</span>}
          {meta && <span className="placard-meta">{meta}</span>}
        </figcaption>
      )}
    </figure>
  );
}
