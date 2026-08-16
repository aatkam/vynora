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

export default function ResetPassword() {
  const { token } = useParams();

  const {
    authenticate
  } = useAuth();

  const navigate =
    useNavigate();

  const [
    form,
    setForm
  ] = useState({
    password: '',
    confirmPassword: ''
  });

  const [
    showPassword,
    setShowPassword
  ] = useState(false);

  const [
    busy,
    setBusy
  ] = useState(false);

  const [
    error,
    setError
  ] = useState('');

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
      !isStrongPassword(
        form.password
      )
    ) {
      setError(
        PASSWORD_RULE_MESSAGE
      );

      return;
    }

    if (
      form.password !==
      form.confirmPassword
    ) {
      setError(
        'Passwords do not match'
      );

      return;
    }

    setBusy(true);

    try {
      const { data } =
        await api.post(
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
            Choose a password you
            do not use on another
            account.
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
              {
                PASSWORD_RULE_MESSAGE
              }
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
                value={
                  form.password
                }
                onChange={change}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Create a strong password"
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

          <label>
            Confirm new password

            <input
              type={
                showPassword
                  ? 'text'
                  : 'password'
              }
              name="confirmPassword"
              value={
                form.confirmPassword
              }
              onChange={change}
              required
              minLength={8}
              autoComplete="new-password"
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