import Artwork from '../lib/art.jsx';
import { seedOf } from '../lib/wallet.jsx';

export default function Avatar({ address, size = 36 }) {
  return <span className="avatar" style={{ width: size, height: size }}><Artwork seed={seedOf(address)} /></span>;
}
