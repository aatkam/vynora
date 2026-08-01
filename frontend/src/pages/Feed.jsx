import { RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import api from '../api/client';
import Composer from '../components/Composer';
import Loader from '../components/Loader';
import PostCard from '../components/PostCard';

export default function Feed() {
  const [scope, setScope] = useState('following');
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [moreBusy, setMoreBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (reset = true) => {
    const targetPage = reset ? 1 : page + 1;
    reset ? setLoading(true) : setMoreBusy(true);
    setError('');
    try {
      const { data } = await api.get(`/posts/feed?scope=${scope}&page=${targetPage}&limit=10`);
      setPosts((current) => reset ? data.posts : [...current, ...data.posts]);
      setPage(targetPage);
      setHasMore(data.hasMore);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load feed');
    } finally {
      setLoading(false);
      setMoreBusy(false);
    }
  }, [scope, page]);

  useEffect(() => {
    let active = true;
    async function initialLoad() {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/posts/feed?scope=${scope}&page=1&limit=10`);
        if (!active) return;
        setPosts(data.posts);
        setPage(1);
        setHasMore(data.hasMore);
      } catch (err) {
        if (active) setError(err.response?.data?.message || 'Could not load feed');
      } finally {
        if (active) setLoading(false);
      }
    }
    initialLoad();
    return () => { active = false; };
  }, [scope]);

  return (
    <div className="page feed-page">
      <header className="page-header">
        <div><span className="eyebrow">Your space</span><h1>Home</h1></div>
        <div className="header-actions">
          <button className="icon-button refresh-button" onClick={() => load(true)} title="Refresh feed" aria-label="Refresh feed"><RefreshCw size={18} /></button>
          <div className="feed-tabs">
            <button className={scope === 'following' ? 'active' : ''} onClick={() => setScope('following')}>Following</button>
            <button className={scope === 'all' ? 'active' : ''} onClick={() => setScope('all')}>Discover</button>
          </div>
        </div>
      </header>

      <Composer onCreated={(post) => setPosts((current) => [post, ...current])} />
      {error && <div className="form-error-box page-error">{error}</div>}

      {loading ? <Loader label="Loading your feed" /> : posts.length ? (
        <>
          <div className="post-list">
            {posts.map((post) => <PostCard key={post._id} post={post} onDelete={(id) => setPosts((current) => current.filter((item) => item._id !== id))} />)}
          </div>
          {hasMore && <div className="load-more-wrap"><button className="secondary-button" onClick={() => load(false)} disabled={moreBusy}>{moreBusy ? 'Loading…' : 'Load more posts'}</button></div>}
        </>
      ) : (
        <div className="empty-state card"><h3>Your feed is quiet</h3><p>Follow people from Explore, switch to Discover, or publish the first post in your circle.</p></div>
      )}
    </div>
  );
}
