const express = require('express');
const path    = require('path');
const fs      = require('fs');
const app     = express();

const PUBLIC     = path.join(__dirname, 'public');
const SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || '';

function serveHtml(file, res) {
  try {
    let html = fs.readFileSync(path.join(PUBLIC, file), 'utf8');
    html = html.replace(/REPLACE_WITH_SCRIPT_URL/g, SCRIPT_URL);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (e) {
    res.status(404).send('Not found: ' + file);
  }
}

app.get('/investor', (req, res) => serveHtml('investor.html', res));
app.get('/',         (req, res) => serveHtml('index.html',    res));
app.use(express.static(PUBLIC));
app.get('*',         (req, res) => serveHtml('index.html',    res));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('SkillBridge Arabia running on port ' + PORT));
