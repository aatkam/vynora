import nodemailer from 'nodemailer';

let transporter;

function parseBoolean(value) {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized =
    value.trim().toLowerCase();

  if (normalized === 'true') {
    return true;
  }

  if (normalized === 'false') {
    return false;
  }

  return undefined;
}

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS
  } = process.env;

  if (
    !SMTP_HOST ||
    !SMTP_PORT ||
    !SMTP_USER ||
    !SMTP_PASS
  ) {
    return null;
  }

  const port =
    Number(SMTP_PORT);

  const configuredSecure =
    parseBoolean(
      SMTP_SECURE
    );

  transporter =
    nodemailer.createTransport({
      host: SMTP_HOST,
      port,

      secure:
        configuredSecure ??
        port === 465,

      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });

  return transporter;
}

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl
}) {
  const mailer =
    getTransporter();

  if (!mailer) {
    return false;
  }

  const info =
    await mailer.sendMail({
      from:
        process.env.MAIL_FROM ||
        process.env.SMTP_USER,

      to,

      subject:
        'Reset your Vynora password',

      text: [
        `Hello ${name},`,
        '',
        'A password reset was requested for your Vynora account.',
        '',
        'Open this link within 15 minutes:',
        resetUrl,
        '',
        'If you did not request this reset, ignore this email.'
      ].join('\n')
    });

  if (
    Array.isArray(info.rejected) &&
    info.rejected.length > 0
  ) {
    throw new Error(
      'SMTP rejected the password reset recipient'
    );
  }

  return true;
}