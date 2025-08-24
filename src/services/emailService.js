const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends a 2FA magic link email.
 * @param {string} to - The recipient's email address.
 * @param {string} token - The 2FA token.
 * @returns {Promise<void>}
 */
async function send2FAMagicLink(to, token) {
  const link = `http://localhost:3000/api/auth/verify-2fa?token=${token}`;
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: to,
    subject: 'Your Gole Kaab Sign-In Link',
    html: `
      <h1>Gole Kaab Sign-In</h1>
      <p>Click the link below to sign in. This link will expire in 10 minutes and can only be used once.</p>
      <a href="${link}" style="padding: 10px 15px; background-color: #4189DD; color: white; text-decoration: none; border-radius: 5px;">Sign In</a>
      <p>If you did not request this, please ignore this email.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`2FA magic link sent to ${to}`);
}


module.exports = {
  send2FAMagicLink,
};
