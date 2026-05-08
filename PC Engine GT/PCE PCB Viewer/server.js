const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;
const host = process.env.HOST || '127.0.0.1';
const viewerRoot = __dirname;
const assetsRoot = path.join(viewerRoot, 'assets');

app.disable('x-powered-by');

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; img-src 'self' data:; script-src 'self'; style-src 'self';"
  );
  next();
});

app.get(['/', '/index.html'], function(req, res) {
  res.sendFile(path.join(viewerRoot, 'index.html'));
});

app.use('/assets', express.static(assetsRoot, {
  dotfiles: 'deny',
  fallthrough: false,
  immutable: true,
  maxAge: '1d',
  redirect: false
}));

app.use((err, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err.status === 403) {
    res.status(403).type('text/plain').send('Forbidden');
    return;
  }

  if (err.status === 404) {
    res.status(404).type('text/plain').send('Not found');
    return;
  }

  res.status(500).type('text/plain').send('Internal Server Error');
});

app.use((req, res) => {
  res.status(404).type('text/plain').send('Not found');
});

app.listen(port, host, () => {
  console.log(`Server started at http://${host}:${port}`);
});
