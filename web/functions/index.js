const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

// Read Resend API key from environment (Functions v2 loads .env automatically).
const RESEND_KEY = process.env.RESEND_API_KEY || '';

// Use direct HTTP API to send email to avoid SDK issues in this environment.
async function sendViaResend({ from, to, subject, html }) {
  if (!RESEND_KEY) throw new Error('Missing RESEND_API_KEY');
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_KEY}`,
    },
    body: JSON.stringify({ from, to, subject, html }),
  });
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Resend API error ${resp.status}: ${body}`);
  }
  return resp.json();
}

const RATE_LIMIT = 5; // messages per window
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

exports.sendContact = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { name = '', email = '', message = '' } = req.body || {};
  if (!message || message.trim() === '') return res.status(400).send('Message is required');

  // Get client IP
  const ipHeader = req.headers['x-forwarded-for'] || req.headers['x-appengine-user-ip'];
  const ip = (ipHeader && String(ipHeader).split(',')[0].trim()) || req.ip || req.connection.remoteAddress || 'unknown';

  const key = encodeURIComponent(ip);
  const docRef = db.collection('contact_rate').doc(key);

  try {
    const now = Date.now();
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(docRef);
      if (!snap.exists) {
        tx.set(docRef, { count: 1, windowStart: admin.firestore.Timestamp.fromMillis(now) });
      } else {
        const data = snap.data();
        const windowStartMs = data.windowStart && data.windowStart.toMillis ? data.windowStart.toMillis() : 0;
        if (now - windowStartMs > WINDOW_MS) {
          tx.set(docRef, { count: 1, windowStart: admin.firestore.Timestamp.fromMillis(now) });
        } else {
          const nextCount = (data.count || 0) + 1;
          if (nextCount > RATE_LIMIT) {
            throw new functions.https.HttpsError('resource-exhausted', 'Rate limit exceeded');
          }
          tx.update(docRef, { count: nextCount });
        }
      }
    });
  } catch (e) {
    if (e && e.code === 'resource-exhausted') {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }
    console.error('Rate limit transaction error', e);
    return res.status(500).json({ error: 'Rate limit error' });
  }

  // Build email
  const subject = name ? `Website contact from ${name}` : 'Website contact';
  const html = `<p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><hr><p>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>`;

  try {
    await sendViaResend({
      from: 'Skeeme <hello@contact.skeeme.com>',
      to: ['hello@skeeme.app'],
      subject,
      html,
    });
  } catch (err) {
    console.error('Resend send error', err);
    return res.status(502).json({ error: 'Email send failed' });
  }

  return res.json({ message: 'Thanks — we received your message' });
});

function escapeHtml(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
