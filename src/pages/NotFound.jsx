import { Link } from 'react-router-dom';
export default function NotFound() {
  return (
    <div className="page wrap center-page">
      <span className="eyebrow">404</span>
      <h1 className="h1">This piece <em>doesn't exist</em>.</h1>
      <Link to="/" className="btn btn-ghost">Back to the gallery</Link>
    </div>
  );
}
