import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const { user, authenticate } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  function change(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const payload = isRegister ? form : { email: form.email, password: form.password };
      const { data } = await api.post(endpoint, payload);
      authenticate(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <div className="auth-brand"><span className="brand-mark"><Sparkles size={20} /></span>Vynora</div>
        <div className="auth-message"><span className="eyebrow">Your social space</span><h1>Share your perspective. Find your people.</h1><p>A calmer social platform for real ideas, meaningful progress and everyday moments.</p></div>
        <div className="floating-note note-one">“Building something new today ✨”</div>
        <div className="floating-note note-two">Meaningful connections</div>
      </section>

      <section className="auth-form-section">
        <form className="auth-form" onSubmit={submit}>
          <div><span className="eyebrow">Welcome to Vynora</span><h2>{isRegister ? 'Create your account' : 'Sign in to continue'}</h2><p>{isRegister ? 'Start sharing with your own circle.' : 'Your feed is ready when you are.'}</p></div>
          {isRegister && (
            <>
              <label>Full name<input name="name" value={form.name} onChange={change} required maxLength={60} placeholder="Your full name" /></label>
              <label>Username<input name="username" value={form.username} onChange={change} required minLength={3} maxLength={24} pattern="[a-zA-Z0-9_]+" placeholder="your_username" /></label>
            </>
          )}
          <label>Email address<input type="email" name="email" value={form.email} onChange={change} required placeholder="you@example.com" /></label>
          <label>
            Password
            <span className="password-field">
              <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={change} required minLength={6} placeholder="At least 6 characters" />
              <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </span>
          </label>
          {!isRegister && (
  <Link
    className="forgot-link"
    to="/forgot-password"
  >
    Forgot password?
  </Link>
)}
          {error && <div className="form-error-box">{error}</div>}
          <button className="primary-button auth-submit" disabled={busy}>{busy ? 'Please wait…' : isRegister ? 'Join Vynora' : 'Sign in'}</button>
          <p className="auth-switch">{isRegister ? 'Already have an account?' : 'New to Vynora?'} <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create account'}</Link></p>
        </form>
      </section>
    </main>
  );
}
