const express = require('express');
const path    = require('path');
const fs      = require('fs');
const app     = express();

const SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || '';

function serveHtml(filePath, res) {
  try {
    let html = fs.readFileSync(filePath, 'utf8');
    html = html.replace(/REPLACE_WITH_SCRIPT_URL/g, SCRIPT_URL);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (e) {
    res.status(404).send('Not found: ' + filePath);
  }
}

// investor.html is in public/
app.get('/investor', (req, res) => {
  serveHtml(path.join(__dirname, 'public', 'investor.html'), res);
});

// index.html is at root
app.get('/', (req, res) => {
  serveHtml(path.join(__dirname, 'index.html'), res);
});

// Static files from public/ (css, images etc)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// Everything else → index.html
app.get('*', (req, res) => {
  serveHtml(path.join(__dirname, 'index.html'), res);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('SkillBridge Arabia on port ' + PORT);
  console.log('index.html  → root');
  console.log('investor    → public/investor.html');
});
