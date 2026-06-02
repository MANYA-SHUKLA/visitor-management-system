const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  return transporter;
}

async function sendMail({ to, subject, text, html }) {
  const transport = getTransporter();
  if (!transport || !to) {
    console.log('[email skipped]', subject, '→', to);
    return;
  }

  try {
    await transport.sendMail({
      from: process.env.SMTP_FROM || 'Visitor Management <noreply@localhost>',
      to,
      subject,
      text,
      html: html || text,
    });
  } catch (err) {
    console.error('Email failed:', err.message);
  }
}

async function sendApprovalRequest(resident, visit) {
  const subject = `Visitor approval: ${visit.visitorName}`;
  const text = [
    `Hello ${resident.name},`,
    '',
    `A visitor is waiting for your approval.`,
    `Name: ${visit.visitorName}`,
    `Phone: ${visit.visitorPhone}`,
    `Purpose: ${visit.purpose}`,
    '',
    `Log in to the resident portal to approve or reject.`,
  ].join('\n');

  await sendMail({ to: resident.email, subject, text });
}

async function sendVisitApproved(guard, visit) {
  const subject = `Visit approved: ${visit.visitorName}`;
  const text = `Visitor ${visit.visitorName} for apartment ${visit.apartment} was approved. You can scan their QR for entry.`;
  await sendMail({ to: guard.email, subject, text });
}

async function sendVisitRejected(resident, visit) {
  const subject = `Visit rejected: ${visit.visitorName}`;
  const text = `You rejected visitor ${visit.visitorName}.`;
  await sendMail({ to: resident.email, subject, text });
}

const ROLE_META = {
  admin: { label: 'Admin', color: '#7c3aed', bg: '#f5f3ff' },
  guard: { label: 'Guard', color: '#d97706', bg: '#fffbeb' },
  resident: { label: 'Resident', color: '#059669', bg: '#ecfdf5' },
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatLoginTime(date) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(date);
}

function buildLoginEmailHtml(user, { clientPlatform, ip, loggedInAt }) {
  const role = ROLE_META[user.role] || {
    label: user.role,
    color: '#0f172a',
    bg: '#f8fafc',
  };
  const platformLabel =
    clientPlatform === 'web'
      ? 'Web portal'
      : clientPlatform === 'ios'
        ? 'Mobile app (iOS)'
        : clientPlatform === 'android'
          ? 'Mobile app (Android)'
          : clientPlatform === 'mobile'
            ? 'Mobile app'
            : 'Unknown client';

  const rows = [
    ['Name', user.name],
    ['Email', user.email],
    ['Role', role.label],
    user.apartment ? ['Flat', user.apartment] : null,
    user.phone ? ['Phone', user.phone] : null,
    ['Platform', platformLabel],
    ['Signed in at', formatLoginTime(loggedInAt)],
    ip ? ['IP address', ip] : null,
  ].filter(Boolean);

  const detailRows = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;width:140px;vertical-align:top;">${escapeHtml(label)}</td>
          <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:14px;font-weight:600;vertical-align:top;">${escapeHtml(value)}</td>
        </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Login alert</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:28px 32px;">
              <p style="margin:0 0 8px;color:#94a3b8;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;">Visitor Management System</p>
              <h1 style="margin:0;color:#ffffff;font-size:24px;line-height:1.3;font-weight:700;">New sign-in detected</h1>
              <p style="margin:10px 0 0;color:#cbd5e1;font-size:14px;line-height:1.5;">Someone just logged in to your visitor management platform.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px 12px;">
              <span style="display:inline-block;padding:6px 12px;border-radius:999px;background:${role.bg};color:${role.color};font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;">${escapeHtml(role.label)}</span>
              <h2 style="margin:16px 0 6px;color:#0f172a;font-size:20px;font-weight:700;">${escapeHtml(user.name)}</h2>
              <p style="margin:0;color:#64748b;font-size:14px;">${escapeHtml(user.email)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;background:#f8fafc;">
                ${detailRows}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px;">
              <p style="margin:0;padding:14px 16px;border-radius:10px;background:#eff6ff;color:#1d4ed8;font-size:13px;line-height:1.5;">
                If this sign-in looks unexpected, review account access and update passwords immediately.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.5;text-align:center;">
                Automated login alert from Visitor Management System
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildLoginEmailText(user, { clientPlatform, ip, loggedInAt }) {
  const role = ROLE_META[user.role]?.label || user.role;
  const platformLabel =
    clientPlatform === 'web'
      ? 'Web portal'
      : clientPlatform === 'ios'
        ? 'Mobile app (iOS)'
        : clientPlatform === 'android'
          ? 'Mobile app (Android)'
          : clientPlatform === 'mobile'
            ? 'Mobile app'
            : 'Unknown client';

  return [
    'New sign-in detected',
    '',
    `Name: ${user.name}`,
    `Email: ${user.email}`,
    `Role: ${role}`,
    user.apartment ? `Flat: ${user.apartment}` : null,
    user.phone ? `Phone: ${user.phone}` : null,
    `Platform: ${platformLabel}`,
    `Signed in at: ${formatLoginTime(loggedInAt)}`,
    ip ? `IP address: ${ip}` : null,
  ]
    .filter(Boolean)
    .join('\n');
}

async function sendLoginNotification(user, meta = {}) {
  const notifyEmail = process.env.ADMIN_NOTIFY_EMAIL || 'shuklamanya99@gmail.com';
  const loggedInAt = meta.loggedInAt || new Date();
  const subject = `Login alert: ${user.name} (${ROLE_META[user.role]?.label || user.role})`;
  const text = buildLoginEmailText(user, { ...meta, loggedInAt });
  const html = buildLoginEmailHtml(user, { ...meta, loggedInAt });

  await sendMail({ to: notifyEmail, subject, text, html });
}

module.exports = {
  sendApprovalRequest,
  sendVisitApproved,
  sendVisitRejected,
  sendLoginNotification,
};
