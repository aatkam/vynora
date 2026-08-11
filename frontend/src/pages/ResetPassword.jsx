import {
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';

import { useState } from 'react';

import {
  Link,
  useNavigate,
  useParams
} from 'react-router-dom';

import api from '../api/client';
import { useAuth } from '../context/AuthContext';

function getPasswordChecks(password = '') {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };
}

function isStrongPassword(password = '') {
  const checks = getPasswordChecks(password);

  return Object.values(checks).every(Boolean);
}

export default function ResetPassword() {
  const { token } = useParams();

  const { authenticate } = useAuth();

  const navigate = useNavigate();

  const [form, setForm] = useState({
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const passwordChecks = getPasswordChecks(
    form.password
  );

  function change(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  }

  async function submit(event) {
    event.preventDefault();

    setError('');

    if (!isStrongPassword(form.password)) {
      setError(
        'Password must be at least 8 characters and include an uppercase letter, lowercase letter, number and special character.'
      );

      return;
    }

    if (
      form.password !== form.confirmPassword
    ) {
      setError('Passwords do not match');
      return;
    }

    setBusy(true);

    try {
      const { data } = await api.post(
        `/auth/reset-password/${token}`,
        form
      );

      authenticate(data);

      navigate('/', {
        replace: true
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Could not reset password'
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
            Secure reset
          </span>

          <h1>
            Create a fresh password.
          </h1>

          <p>
            Choose a password you do not use
            on another account.
          </p>
        </div>
      </section>

      <section className="auth-form-section">
        <form
          className="auth-form"
          onSubmit={submit}
        >
          <div>
            <span className="eyebrow">
              Almost finished
            </span>

            <h2>
              Set a new password
            </h2>

            <p>
              Use at least 8 characters with
              an uppercase letter, lowercase
              letter, number and special
              character.
            </p>
          </div>

          <label>
            New password

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
                minLength={8}
                placeholder="Create a strong password"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (current) => !current
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

          <div
            className="password-requirements"
            style={{
              display: 'grid',
              gap: '5px',
              fontSize: '0.86rem',
              marginTop: '-6px'
            }}
          >
            <span
              style={{
                opacity: passwordChecks.length
                  ? 1
                  : 0.65
              }}
            >
              {passwordChecks.length
                ? '✓'
                : '○'}{' '}
              At least 8 characters
            </span>

            <span
              style={{
                opacity:
                  passwordChecks.uppercase
                    ? 1
                    : 0.65
              }}
            >
              {passwordChecks.uppercase
                ? '✓'
                : '○'}{' '}
              One uppercase letter
            </span>

            <span
              style={{
                opacity:
                  passwordChecks.lowercase
                    ? 1
                    : 0.65
              }}
            >
              {passwordChecks.lowercase
                ? '✓'
                : '○'}{' '}
              One lowercase letter
            </span>

            <span
              style={{
                opacity: passwordChecks.number
                  ? 1
                  : 0.65
              }}
            >
              {passwordChecks.number
                ? '✓'
                : '○'}{' '}
              One number
            </span>

            <span
              style={{
                opacity: passwordChecks.special
                  ? 1
                  : 0.65
              }}
            >
              {passwordChecks.special
                ? '✓'
                : '○'}{' '}
              One special character
            </span>
          </div>

          <label>
            Confirm new password

            <input
              type={
                showPassword
                  ? 'text'
                  : 'password'
              }
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={change}
              required
              minLength={8}
              placeholder="Repeat your new password"
            />
          </label>

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
              ? 'Updating password…'
              : 'Reset password'}
          </button>

          <p className="auth-switch">
            <Link to="/login">
              Back to sign in
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}