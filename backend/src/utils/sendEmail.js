const BREVO_EMAIL_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';
const EMAIL_TIMEOUT_MS = 10000;

function getEmailConfig() {
  const {
    BREVO_API_KEY,
    BREVO_SENDER_EMAIL,
    BREVO_SENDER_NAME = 'Vynora'
  } = process.env;

  /*
   * Email delivery is optional during local development.
   * When these values are missing, forgot-password falls back to
   * showing the reset URL locally (never in production).
   */
  if (!BREVO_API_KEY || !BREVO_SENDER_EMAIL) {
    return null;
  }

  return {
    apiKey: BREVO_API_KEY,
    senderEmail: BREVO_SENDER_EMAIL,
    senderName: BREVO_SENDER_NAME
  };
}

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl
}) {
  const config = getEmailConfig();

  if (!config) {
    return false;
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    EMAIL_TIMEOUT_MS
  );

  try {
    const response = await fetch(BREVO_EMAIL_ENDPOINT, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': config.apiKey
      },
      signal: controller.signal,
      body: JSON.stringify({
        sender: {
          name: config.senderName,
          email: config.senderEmail
        },
        to: [
          {
            email: to,
            name
          }
        ],
        subject: 'Reset your Vynora password',
        textContent: [
          `Hello ${name},`,
          '',
          'A password reset was requested for your Vynora account.',
          '',
          'Open this link within 15 minutes:',
          resetUrl,
          '',
          'If you did not request this reset, ignore this email.'
        ].join('\n')
      })
    });

    if (!response.ok) {
      const details = await response
        .text()
        .catch(() => '');

      console.error(
        `Brevo email API error (${response.status}):`,
        details || response.statusText
      );

      throw new Error('Email provider rejected the request');
    }

    return true;
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('Email provider request timed out');
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
