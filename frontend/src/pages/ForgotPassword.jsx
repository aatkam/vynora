import {
  AtSign,
  Sparkles
} from 'lucide-react';

import { useState } from 'react';

import {
  Link
} from 'react-router-dom';

import api from '../api/client';

export default function ForgotPassword() {
  const [
    identifier,
    setIdentifier
  ] = useState('');

  const [
    busy,
    setBusy
  ] = useState(false);

  const [
    error,
    setError
  ] = useState('');

  const [
    message,
    setMessage
  ] = useState('');

  const [
    resetUrl,
    setResetUrl
  ] = useState('');

  async function submit(event) {
    event.preventDefault();

    setBusy(true);
    setError('');
    setMessage('');
    setResetUrl('');

    try {
      const { data } =
        await api.post(
          '/auth/forgot-password',
          {
            identifier
          }
        );

      setMessage(
        data.message
      );

      setResetUrl(
        data.resetUrl || ''
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Could not prepare password reset'
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
            Account recovery
          </span>

          <h1>
            Let’s get you back
            into Vynora.
          </h1>

          <p>
            Enter your email or
            username. If the account
            exists, Vynora will send
            a secure reset link to
            the email saved on that
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
              Forgot password
            </span>

            <h2>
              Reset your password
            </h2>

            <p>
              You can use either
              your registered email
              or your username.
            </p>
          </div>

          <label>
            Email or username

            <span className="password-field">
              <input
                type="text"
                value={identifier}
                onChange={event =>
                  setIdentifier(
                    event.target.value
                  )
                }
                required
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="username"
                placeholder="you@example.com or username"
              />

              <span className="field-icon">
                <AtSign size={18} />
              </span>
            </span>
          </label>

          {error && (
            <div className="form-error-box">
              {error}
            </div>
          )}

          {message && (
            <div className="form-success-box">
              {message}
            </div>
          )}

          {resetUrl && (
            <a
              className="secondary-button dev-reset-link"
              href={resetUrl}
            >
              Open password reset page
            </a>
          )}

          <button
            className="primary-button auth-submit"
            disabled={busy}
          >
            {busy
              ? 'Preparing link…'
              : 'Send reset instructions'}
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