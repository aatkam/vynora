import { ImagePlus, Send, X } from 'lucide-react';
import { useRef, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

export default function Composer({ onCreated }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  function chooseFile(event) {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (selected.size > 5 * 1024 * 1024) return setError('Image must be smaller than 5 MB');
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setError('');
  }

  function clearImage() {
    setFile(null);
    setPreview('');
    if (inputRef.current) inputRef.current.value = '';
  }

  async function submit(event) {
    event.preventDefault();
    if (!content.trim() && !file) return setError('Write something or choose an image');
    setBusy(true);
    setError('');
    try {
      let imageUrl = '';
      if (file) {
        const form = new FormData();
        form.append('image', file);
        const upload = await api.post('/uploads', form, { headers: { 'Content-Type': 'multipart/form-data' } });
        imageUrl = upload.data.url;
      }
      const { data } = await api.post('/posts', { content, imageUrl });
      onCreated(data.post);
      setContent('');
      clearImage();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not publish your post');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="composer card" onSubmit={submit}>
      <Avatar user={user} size="md" />
      <div className="composer-main">
        <textarea value={content} maxLength={600} onChange={(e) => setContent(e.target.value)} placeholder="Share a thought, moment or progress update…" />
        {preview && <div className="image-preview"><img src={preview} alt="Selected" /><button type="button" onClick={clearImage}><X size={17} /></button></div>}
        {error && <p className="form-error">{error}</p>}
        <div className="composer-actions">
          <label className="attach-button"><ImagePlus size={19} /><span>Add image</span><input ref={inputRef} type="file" accept="image/*" onChange={chooseFile} /></label>
          <span className="character-count">{content.length}/600</span>
          <button className="primary-button publish-button" disabled={busy}><Send size={17} />{busy ? 'Publishing…' : 'Publish'}</button>
        </div>
      </div>
    </form>
  );
}
