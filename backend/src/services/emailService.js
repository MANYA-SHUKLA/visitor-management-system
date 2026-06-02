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

module.exports = {
  sendApprovalRequest,
  sendVisitApproved,
  sendVisitRejected,
};
