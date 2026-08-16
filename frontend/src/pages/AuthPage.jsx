import {
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';

import { useState } from 'react';

import {
  Link,
  Navigate,
  useNavigate
} from 'react-router-dom';

import api from '../api/client';

import {
  useAuth
} from '../context/AuthContext';

const PASSWORD_RULE_MESSAGE =
  'Use at least 8 characters with uppercase, lowercase, a number and a special character.';

function isStrongPassword(password = '') {
  return (
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

export default function AuthPage({
  mode
}) {
  const isRegister =
    mode === 'register';

  const {
    user,
    authenticate
  } = useAuth();

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    identifier: '',
    password: ''
  });

  const [
    showPassword,
    setShowPassword
  ] = useState(false);

  const [
    error,
    setError
  ] = useState('');

  const [
    busy,
    setBusy
  ] = useState(false);

  if (user) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  function change(event) {
    setForm({
      ...form,
      [event.target.name]:
        event.target.value
    });
  }

  async function submit(event) {
    event.preventDefault();

    setError('');

    if (
      isRegister &&
      !isStrongPassword(form.password)
    ) {
      setError(
        PASSWORD_RULE_MESSAGE
      );

      return;
    }

    setBusy(true);

    try {
      const endpoint =
        isRegister
          ? '/auth/register'
          : '/auth/login';

      const payload =
        isRegister
          ? {
              name: form.name,
              username: form.username,
              email: form.email,
              password: form.password
            }
          : {
              identifier:
                form.identifier,
              password:
                form.password
            };

      const { data } =
        await api.post(
          endpoint,
          payload
        );

      authenticate(data);

      navigate('/');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Something went wrong'
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <div className="auth-brand">
          <span className="brand-mark">
            <Sparkles size={20} />
          </span>

          Vynora
        </div>

        <div className="auth-message">
          <span className="eyebrow">
            Your social space
          </span>

          <h1>
            Share your perspective.
            Find your people.
          </h1>

          <p>
            A calmer social platform
            for real ideas, meaningful
            progress and everyday
            moments.
          </p>
        </div>

        <div className="floating-note note-one">
          “Building something new
          today ✨”
        </div>

        <div className="floating-note note-two">
          Meaningful connections
        </div>
      </section>

      <section className="auth-form-section">
        <form
          className="auth-form"
          onSubmit={submit}
        >
          <div>
            <span className="eyebrow">
              Welcome to Vynora
            </span>

            <h2>
              {isRegister
                ? 'Create your account'
                : 'Sign in to continue'}
            </h2>

            <p>
              {isRegister
                ? 'Start sharing with your own circle.'
                : 'Use your email or username to continue.'}
            </p>
          </div>

          {isRegister && (
            <>
              <label>
                Full name

                <input
                  name="name"
                  value={form.name}
                  onChange={change}
                  required
                  maxLength={60}
                  autoComplete="name"
                  placeholder="Your full name"
                />
              </label>

              <label>
                Username

                <input
                  name="username"
                  value={form.username}
                  onChange={change}
                  required
                  minLength={3}
                  maxLength={24}
                  pattern="[a-zA-Z0-9_]+"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  placeholder="your_username"
                />
              </label>

              <label>
                Email address

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={change}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </label>
            </>
          )}

          {!isRegister && (
            <label>
              Email or username

              <input
                type="text"
                name="identifier"
                value={
                  form.identifier
                }
                onChange={change}
                required
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="username"
                placeholder="you@example.com or username"
              />
            </label>
          )}

          <label>
            Password

            <span className="password-field">
              <input
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                name="password"
                value={form.password}
                onChange={change}
                required
                minLength={
                  isRegister ? 8 : 1
                }
                autoComplete={
                  isRegister
                    ? 'new-password'
                    : 'current-password'
                }
                placeholder={
                  isRegister
                    ? 'Create a strong password'
                    : 'Your password'
                }
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    current =>
                      !current
                  )
                }
                aria-label={
                  showPassword
                    ? 'Hide password'
                    : 'Show password'
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </span>
          </label>

          {isRegister && (
            <p
              style={{
                color:
                  'var(--muted)',
                fontSize: '.8rem',
                margin:
                  '-8px 0 0'
              }}
            >
              {
                PASSWORD_RULE_MESSAGE
              }
            </p>
          )}

          {!isRegister && (
            <Link
              className="forgot-link"
              to="/forgot-password"
            >
              Forgot password?
            </Link>
          )}

          {error && (
            <div className="form-error-box">
              {error}
            </div>
          )}

          <button
            className="primary-button auth-submit"
            disabled={busy}
          >
            {busy
              ? 'Please wait…'
              : isRegister
                ? 'Join Vynora'
                : 'Sign in'}
          </button>

          <p className="auth-switch">
            {isRegister
              ? 'Already have an account?'
              : 'New to Vynora?'}{' '}

            <Link
              to={
                isRegister
                  ? '/login'
                  : '/register'
              }
            >
              {isRegister
                ? 'Sign in'
                : 'Create account'}
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}