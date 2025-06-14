const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const multer = require('multer');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

const contentDir = path.join(__dirname, 'config', 'content');
const pagesPath = path.join(contentDir, 'pages.md');
const mediaDir = path.join(contentDir, 'media');

app.use('/media', express.static(mediaDir));
app.use(express.urlencoded({ extended: true }));
app.use(express.text({ type: 'text/plain' }));

const storage = multer.diskStorage({
  destination: mediaDir,
  filename: (req, file, cb) => {
    let safeName = path.basename(file.originalname);
    if (safeName !== file.originalname || /[\\/]/.test(safeName)) {
      return cb(new Error('Invalid filename'));
    }
    safeName = safeName.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, safeName);
  }
});
const upload = multer({ storage });

app.get('/editor', async (req, res) => {
  if (req.query.raw) {
    const data = await fs.readFile(pagesPath, 'utf8');
    return res.type('text/plain').send(data);
  }
  const htmlPath = path.join(__dirname, 'editor.html');
  res.sendFile(htmlPath);
});

app.post('/editor', upload.array('media'), async (req, res) => {
  try {
    const pageCount = parseInt(req.body.pageCount, 10) || 0;
    const sections = [];
    for (let i = 0; i < pageCount; i++) {
      sections.push(req.body[`page${i}`] || '');
    }
    await fs.outputFile(pagesPath, sections.join('\n---\n'));
    res.redirect('/editor');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving content');
  }
});

app.get('/pages/:index', async (req, res) => {
  try {
    const idx = parseInt(req.params.index, 10);
    if (isNaN(idx) || idx < 0) {
      return res.status(400).send('Invalid index');
    }
    const data = await fs.readFile(pagesPath, 'utf8').catch(() => '');
    const sections = data ? data.split('\n---\n') : [''];
    const page = sections[idx] || '';
    res.json({ page, total: sections.length });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error reading content');
  }
});

app.post('/pages/:index', async (req, res) => {
  try {
    const idx = parseInt(req.params.index, 10);
    if (isNaN(idx) || idx < 0) {
      return res.status(400).send('Invalid index');
    }
    const data = await fs.readFile(pagesPath, 'utf8').catch(() => '');
    let sections = data ? data.split('\n---\n') : [];
    while (sections.length <= idx) {
      sections.push('');
    }
    sections[idx] = req.body || '';
    await fs.outputFile(pagesPath, sections.join('\n---\n'));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving content');
  }
});

app.post('/build', (req, res) => {
  const flags = req.body.flags ? req.body.flags.split(/\s+/).filter(Boolean) : [];
  const child = spawn('node', ['generator.js', ...flags], { cwd: __dirname });

  child.stdout.on('data', data => process.stdout.write(data));
  child.stderr.on('data', data => process.stderr.write(data));

  child.on('close', code => {
    if (code === 0) {
      res.send('Build succeeded');
    } else {
      res.status(500).send('Build failed');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Editor server running at http://localhost:${PORT}/editor`);
});
