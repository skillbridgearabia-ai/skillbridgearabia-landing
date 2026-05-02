const express = require('express');
const path    = require('path');
const fs      = require('fs');
const app     = express();

const PUBLIC = path.join(__dirname, 'public');

function serveHtml(filePath, res) {
  try {
    const html = fs.readFileSync(filePath, 'utf8');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (e) {
    res.status(404).send('Not found: ' + filePath);
  }
}

app.get('/investor', (req, res) => serveHtml(path.join(PUBLIC, 'investor.html'), res));
app.get('/',        (req, res) => serveHtml(path.join(__dirname, 'index.html'), res));
app.use(express.static(PUBLIC));
app.use(express.static(__dirname));
app.get('*',        (req, res) => serveHtml(path.join(__dirname, 'index.html'), res));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('SkillBridge Arabia on port ' + PORT));
