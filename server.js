const express = require('express');
const path    = require('path');
const fs      = require('fs');
const app     = express();

app.get('/investor', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'investor.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('SkillBridge Arabia on port ' + PORT));
