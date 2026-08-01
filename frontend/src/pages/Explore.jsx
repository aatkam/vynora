import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api/client';
import Loader from '../components/Loader';
import PostCard from '../components/PostCard';
import UserCard from '../components/UserCard';

export default function Explore({ searchOnly = false }) {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function initialLoad() {
      setLoading(true);
      setError('');
      try {
        if (searchOnly) {
          setPosts([]);
          setUsers([]);
          return;
        }
        const [postResult, userResult] = await Promise.all([
          api.get('/posts/feed?scope=all&limit=8'),
          api.get('/users/suggestions')
        ]);
        if (!active) return;
        setPosts(postResult.data.posts);
        setUsers(userResult.data.users);
      } catch (err) {
        if (active) setError(err.response?.data?.message || 'Could not load Explore');
      } finally {
        if (active) setLoading(false);
      }
    }
    initialLoad();
    return () => { active = false; };
  }, [searchOnly]);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      if (!query.trim()) {
        if (searchOnly) {
          setUsers([]);
          setPosts([]);
        } else {
          try {
            const [postResult, userResult] = await Promise.all([
              api.get('/posts/feed?scope=all&limit=8'),
              api.get('/users/suggestions')
            ]);
            setPosts(postResult.data.posts);
            setUsers(userResult.data.users);
          } catch {
            // Keep the current Explore content if refresh fails.
          }
        }
        setSearching(false);
        return;
      }

      setSearching(true);
      setError('');
      try {
        const [userResult, postResult] = await Promise.all([
          api.get(`/users/search?q=${encodeURIComponent(query)}`),
          api.get(`/posts/search?q=${encodeURIComponent(query)}`)
        ]);
        setUsers(userResult.data.users);
        setPosts(postResult.data.posts);
      } catch (err) {
        setError(err.response?.data?.message || 'Search failed');
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [query, searchOnly]);

  const peopleTitle = query ? 'People' : 'People to discover';
  const postsTitle = query ? 'Matching posts' : searchOnly ? 'Search results' : 'Fresh from Vynora';

  return (
    <div className="page">
      <header className="page-header"><div><span className="eyebrow">{searchOnly ? 'Find anything' : 'Beyond your circle'}</span><h1>{searchOnly ? 'Search' : 'Explore'}</h1></div></header>
      <div className="search-box card"><Search size={20} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search people, usernames or posts…" /></div>
      {error && <div className="form-error-box page-error">{error}</div>}

      {loading ? <Loader label="Loading Explore" /> : (
        <>
          {(users.length > 0 || (!query && !searchOnly)) && (
            <section className="result-section">
              <h2>{peopleTitle}</h2>
              {users.length ? (
                <div className="people-grid">
                  {users.map((person) => <UserCard key={person.id} person={person} onChanged={(updated) => setUsers((current) => current.map((item) => item.id === updated.id ? updated : item))} />)}
                </div>
              ) : <div className="empty-state card compact-empty"><p>No new people to suggest right now.</p></div>}
            </section>
          )}

          <section className="result-section">
            <h2>{postsTitle}</h2>
            {searching ? <Loader label="Searching" /> : posts.length ? (
              <div className="post-list">{posts.map((post) => <PostCard key={post._id} post={post} onDelete={(id) => setPosts((current) => current.filter((item) => item._id !== id))} />)}</div>
            ) : (
              <div className="empty-state card"><h3>{query ? 'No results found' : searchOnly ? 'Start searching' : 'No public posts yet'}</h3><p>{query ? 'Try a different word or username.' : searchOnly ? 'Search for a person, idea or conversation.' : 'Published posts will appear here.'}</p></div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
