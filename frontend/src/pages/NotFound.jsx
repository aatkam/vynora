import { Link } from 'react-router-dom';
export default function NotFound() {
  return <main className="not-found"><span>404</span><h1>This page drifted away.</h1><p>The link may be old, or the page no longer exists.</p><Link className="primary-button" to="/">Return home</Link></main>;
}
