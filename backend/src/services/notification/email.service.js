const nodemailer = require('nodemailer');
const logger = require('../../utils/logger');

let transporter;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_PORT === '465',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
};

const TEMPLATES = {
  welcome: (data) => ({
    subject: `Welcome to SmartHR Nexus, ${data.name}!`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#f1f5f9;padding:32px;border-radius:16px">
        <div style="text-align:center;margin-bottom:24px">
          <h1 style="color:#6366f1;font-size:28px;margin:0">SmartHR Nexus</h1>
          <p style="color:#64748b;margin-top:8px">AI-Powered HR Platform</p>
        </div>
        <h2 style="color:#f1f5f9">Welcome, ${data.name}! 👋</h2>
        <p style="color:#94a3b8;line-height:1.6">Your account has been created successfully. You can now access the platform.</p>
        <a href="${data.verifyUrl}" style="display:inline-block;margin-top:24px;padding:12px 24px;background:#6366f1;color:#fff;text-decoration:none;border-radius:12px;font-weight:600">
          Verify Email Address
        </a>
        <p style="color:#475569;font-size:12px;margin-top:32px">This link expires in 24 hours.</p>
      </div>`,
  }),
  resetPassword: (data) => ({
    subject: 'SmartHR Nexus – Password Reset',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#f1f5f9;padding:32px;border-radius:16px">
        <h2>Password Reset Request</h2>
        <p style="color:#94a3b8">Hi ${data.name}, click below to reset your password. This link expires in 10 minutes.</p>
        <a href="${data.resetUrl}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#ef4444;color:#fff;text-decoration:none;border-radius:12px;font-weight:600">
          Reset Password
        </a>
        <p style="color:#475569;font-size:12px;margin-top:24px">If you didn't request this, please ignore this email.</p>
      </div>`,
  }),
  leaveApproved: (data) => ({
    subject: 'Leave Request Approved',
    html: `<div style="font-family:sans-serif;padding:24px"><h3>Hi ${data.name},</h3><p>Your leave request from <strong>${data.from}</strong> to <strong>${data.to}</strong> has been approved.</p></div>`,
  }),
  payslipReady: (data) => ({
    subject: `Payslip Ready – ${data.month} ${data.year}`,
    html: `<div style="font-family:sans-serif;padding:24px"><h3>Hi ${data.name},</h3><p>Your payslip for ${data.month} ${data.year} is ready. Login to SmartHR Nexus to view it.</p></div>`,
  }),
};

/**
 * Send email using template or raw content
 */
const sendEmail = async ({ to, subject, template, data, html, text }) => {
  try {
    let mailOptions = {
      from: `"${process.env.FROM_NAME || 'SmartHR Nexus'}" <${process.env.FROM_EMAIL}>`,
      to,
    };

    if (template && TEMPLATES[template]) {
      const rendered = TEMPLATES[template](data);
      mailOptions.subject = rendered.subject;
      mailOptions.html = rendered.html;
    } else {
      mailOptions.subject = subject;
      mailOptions.html = html;
      mailOptions.text = text;
    }

    const info = await getTransporter().sendMail(mailOptions);
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Email send failed to ${to}: ${error.message}`);
    throw error;
  }
};

module.exports = { sendEmail };
