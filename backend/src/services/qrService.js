const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');

function generateQrToken(visitId) {
  return jwt.sign(
    { visitId: visitId.toString(), type: 'visit_entry' },
    process.env.QR_SECRET || process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
}

function verifyQrToken(token) {
  return jwt.verify(
    token,
    process.env.QR_SECRET || process.env.JWT_SECRET
  );
}

async function qrDataUrl(token) {
  return QRCode.toDataURL(token, { width: 280, margin: 2 });
}

module.exports = { generateQrToken, verifyQrToken, qrDataUrl };
