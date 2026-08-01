import nodemailer from 'nodemailer';

let transporter;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS
  } = process.env;

  /*
   * During local development SMTP is optional.
   * The reset link will appear directly on the page.
   */
  if (
    !SMTP_HOST ||
    !SMTP_PORT ||
    !SMTP_USER ||
    !SMTP_PASS
  ) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,

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
  const mailer = getTransporter();

  if (!mailer) {
    return false;
  }

  await mailer.sendMail({
    from:
      process.env.MAIL_FROM ||
      process.env.SMTP_USER,

    to,

    subject: 'Reset your Vynora password',

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

  return true;
}