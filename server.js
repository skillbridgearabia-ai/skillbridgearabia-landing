const express = require('express');
const path    = require('path');
const https   = require('https');

const app  = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// ── POST /api/demo  →  Google Sheets via Apps Script ──
app.post('/api/demo', (req, res) => {
  const { name, email, company, role, message } = req.body;

  if (!name || !email || !email.includes('@')) {
    return res.status(400).json({ ok: false, error: 'Name and valid email required' });
  }

  const scriptUrl = process.env.GOOGLE_SCRIPT_URL;

  const payload = JSON.stringify({
    name, email,
    company:   company  || '',
    role:      role     || '',
    message:   message  || '',
    timestamp: new Date().toISOString(),
    source:    'landing-demo-request',
  });

  if (!scriptUrl) {
    console.log(`[demo] No sheet configured – request from: ${name} <${email}>`);
    return res.json({ ok: true });
  }

  const url = new URL(scriptUrl);
  const options = {
    hostname: url.hostname,
    path:     url.pathname + url.search,
    method:   'POST',
    headers:  {
      'Content-Type':   'application/json',
      'Content-Length': Buffer.byteLength(payload),
    },
  };

  const proxyReq = https.request(options, (proxyRes) => {
    let data = '';
    proxyRes.on('data', c => { data += c; });
    proxyRes.on('end', () => {
      console.log(`[demo] Saved: ${name} <${email}>`);
      res.json({ ok: true });
    });
  });

  proxyReq.on('error', (err) => {
    console.error('[demo] Sheet error:', err.message);
    res.json({ ok: true }); // still succeed for user
  });

  proxyReq.write(payload);
  proxyReq.end();
});

// ── Serve index.html ──
app.get('/investor', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'investor.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`SkillBridge Arabia landing on port ${port}`);
  console.log(`Sheet: ${process.env.GOOGLE_SCRIPT_URL ? 'Connected ✅' : 'Not set (add GOOGLE_SCRIPT_URL)'}`);
});

module.exports = app;
