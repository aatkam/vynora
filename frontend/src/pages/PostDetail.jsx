import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';
import Loader from '../components/Loader';
import PostCard from '../components/PostCard';

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/posts/${id}`);
        setPost(data.post);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load post');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <Loader label="Loading post" />;

  return (
    <div className="page post-detail-page">
      <header className="page-header">
        <div>
          <Link className="back-link" to="/"><ArrowLeft size={18} />Back to feed</Link>
          <span className="eyebrow">Conversation</span>
          <h1>Post</h1>
        </div>
      </header>
      {post ? <PostCard post={post} onDelete={() => navigate('/')} /> : <div className="empty-state card"><h3>Post unavailable</h3><p>{error || 'This post may have been deleted.'}</p></div>}
    </div>
  );
}
