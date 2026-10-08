import { Link } from 'react-router-dom';
export default function NotFound() {
  return (
    <div className="page empty-page">
      <h1 className="h1">This page doesn't exist.</h1>
      <Link to="/" className="btn btn-light">Back to Discover</Link>
    </div>
  );
}
