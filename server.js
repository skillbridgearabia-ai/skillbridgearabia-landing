const express = require('express');
const path    = require('path');
const app     = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Inject Google Script URL from environment variable ────────────────────
// This replaces the placeholder in both HTML files at serve time
// Set GOOGLE_SCRIPT_URL in Render environment variables
function injectScriptUrl(html) {
  const url = process.env.GOOGLE_SCRIPT_URL || '';
  return html.replace(/REPLACE_WITH_SCRIPT_URL/g, url);
}

// ── Routes ────────────────────────────────────────────────────────────────

// Investor page
app.get('/investor', (req, res) => {
  const fs   = require('fs');
  const file = path.join(__dirname, 'public', 'investor.html');
  try {
    const html = injectScriptUrl(fs.readFileSync(file, 'utf8'));
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (e) {
    res.status(404).send('Investor page not found. Please add public/investor.html');
  }
});

// Main company profile — catch all other routes
app.get('*', (req, res) => {
  const fs   = require('fs');
  const file = path.join(__dirname, 'public', 'index.html');
  try {
    const html = injectScriptUrl(fs.readFileSync(file, 'utf8'));
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (e) {
    res.status(500).send('Server error');
  }
});

// ── Start ─────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SkillBridge Arabia running on port ${PORT}`);
});
