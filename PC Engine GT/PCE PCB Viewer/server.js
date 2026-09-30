const express = require('express');
const fs = require('fs');
const path = require('path');

const viewerRoot = __dirname;
const assetsRoot = path.join(viewerRoot, 'assets');

// Demo copy. The viewer sends nothing, so test mode stubs nothing; what it guards is that a demo
// image is never mistaken for production or run as it. Two layers that come from different places
// and must agree, as OrderBooks' stamped data and DemoMode do:
//   - the STAMP is a file the demo image's Dockerfile writes at build time; production's never has one;
//   - TEST MODE is the switch the demo compose file hard-wires on at run time.
// Startup refuses either without the other, and /health reports both for the demo-live profile.
const STAMP_FILE = 'demo-copy.stamp';
const TEST_MODE_VARIABLE = 'PCE_VIEWER_TEST_MODE';

function readDemoState(root, env) {
  let demoCopy = null;
  try {
    demoCopy = fs.readFileSync(path.join(root, STAMP_FILE), 'utf8').trim() || null;
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }

  return { testMode: env[TEST_MODE_VARIABLE] === 'true', demoCopy };
}

// The sentence startup prints when the two layers disagree, or null when they agree.
function demoMismatch(state) {
  if (state.demoCopy && !state.testMode) {
    return `This viewer is stamped as a demo copy (${STAMP_FILE}: ${state.demoCopy}) but test mode is off. ` +
      `Set ${TEST_MODE_VARIABLE}=true, or deploy the production image, which carries no stamp.`;
  }

  if (state.testMode && !state.demoCopy) {
    return `${TEST_MODE_VARIABLE} is on (test mode is on) but this viewer is not stamped as a demo copy (no ${STAMP_FILE}). ` +
      'Deploy the demo image from Deployment/Demo, or turn test mode off.';
  }

  return null;
}

function createApp(demoState) {
  const app = express();

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

  app.get('/health', function(req, res) {
    res.json({ status: 'ok', testMode: demoState.testMode, demoCopy: demoState.demoCopy });
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

  return app;
}

if (require.main === module) {
  const port = process.env.PORT || 8080;
  const host = process.env.HOST || '127.0.0.1';
  const demoState = readDemoState(viewerRoot, process.env);
  const mismatch = demoMismatch(demoState);

  if (mismatch) {
    console.error(`Refusing to start: ${mismatch}`);
    process.exit(1);
  }

  createApp(demoState).listen(port, host, () => {
    const mode = demoState.testMode ? ` (demo copy "${demoState.demoCopy}", test mode on)` : '';
    console.log(`Server started at http://${host}:${port}${mode}`);
  });
}

module.exports = { readDemoState, demoMismatch, createApp, STAMP_FILE, TEST_MODE_VARIABLE };
