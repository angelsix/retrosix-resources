// The viewer's own tests. `npm test` runs them on a developer machine, and the demo-live profile's
// test step runs them inside the deployed demo container, so they need nothing but Node's built-ins.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const viewerRoot = path.join(__dirname, '..');
const { readDemoState, demoMismatch, createApp, STAMP_FILE, TEST_MODE_VARIABLE } = require('../server.js');

// A folder standing in for the viewer's root, with or without a demo stamp in it.
function rootWith(stamp) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pce-viewer-'));
  if (stamp !== undefined) {
    fs.writeFileSync(path.join(root, STAMP_FILE), stamp);
  }
  return root;
}

// Starts a copy of server.js as its own process, in a root holding the given stamp (or none), and
// resolves with how it ended, or with 'listening' once it is serving (and stops it). Startup
// refusal is the behaviour under test, so the real entry point is run rather than the functions it
// calls. A copy, because the demo image runs these tests with a real stamp beside the real server.js.
function startServer(stamp, env) {
  const root = rootWith(stamp);
  fs.copyFileSync(path.join(viewerRoot, 'server.js'), path.join(root, 'server.js'));
  fs.symlinkSync(path.join(viewerRoot, 'node_modules'), path.join(root, 'node_modules'), 'dir');

  return new Promise((resolve) => {
    const child = spawn(process.execPath, [path.join(root, 'server.js')], {
      env: { ...process.env, PORT: '0', HOST: '127.0.0.1', [TEST_MODE_VARIABLE]: '', ...env },
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let output = '';
    const collect = (chunk) => {
      output += chunk;
      if (output.includes('Server started')) {
        child.kill();
        resolve({ code: 'listening', output });
      }
    };
    child.stdout.on('data', collect);
    child.stderr.on('data', collect);
    child.on('exit', (code) => resolve({ code, output }));
  });
}

async function getHealth(app) {
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/health`);
    return { status: response.status, body: await response.json() };
  } finally {
    server.close();
  }
}

test('A demo stamp without test mode is a mismatch', () => {
  const state = readDemoState(rootWith('demolive-pce-boardview\n'), {});
  assert.deepStrictEqual(state, { testMode: false, demoCopy: 'demolive-pce-boardview' });
  assert.match(demoMismatch(state), /stamped as a demo copy.*test mode is off/);
});

test('Test mode without a demo stamp is a mismatch', () => {
  const state = readDemoState(rootWith(), { [TEST_MODE_VARIABLE]: 'true' });
  assert.deepStrictEqual(state, { testMode: true, demoCopy: null });
  assert.match(demoMismatch(state), /test mode is on.*not stamped as a demo copy/);
});

test('A blank stamp does not count as a stamp', () => {
  const state = readDemoState(rootWith('  \n'), { [TEST_MODE_VARIABLE]: 'true' });
  assert.strictEqual(state.demoCopy, null);
  assert.ok(demoMismatch(state));
});

test('Production and a stamped demo in test mode both agree', () => {
  assert.strictEqual(demoMismatch(readDemoState(rootWith(), {})), null);
  assert.strictEqual(demoMismatch(readDemoState(rootWith('demo'), { [TEST_MODE_VARIABLE]: 'true' })), null);
});

test('Startup refuses test mode on an unstamped viewer', async () => {
  const result = await startServer(undefined, { [TEST_MODE_VARIABLE]: 'true' });
  assert.strictEqual(result.code, 1, result.output);
  assert.match(result.output, /Refusing to start: .*not stamped as a demo copy/);
});

test('Startup refuses a demo stamp without test mode', async () => {
  const result = await startServer('demolive-pce-boardview', {});
  assert.strictEqual(result.code, 1, result.output);
  assert.match(result.output, /Refusing to start: .*stamped as a demo copy.*test mode is off/);
});

test('Startup serves production and a stamped demo in test mode', async () => {
  assert.strictEqual((await startServer(undefined, {})).code, 'listening');
  const demo = await startServer('demolive-pce-boardview', { [TEST_MODE_VARIABLE]: 'true' });
  assert.strictEqual(demo.code, 'listening', demo.output);
  assert.match(demo.output, /demo copy "demolive-pce-boardview", test mode on/);
});

test('Health reports test mode and the demo stamp', async () => {
  const { status, body } = await getHealth(createApp({ testMode: true, demoCopy: 'demolive-pce-boardview' }));
  assert.strictEqual(status, 200);
  assert.deepStrictEqual(body, { status: 'ok', testMode: true, demoCopy: 'demolive-pce-boardview' });
});

test('Health on production reports no test mode and no stamp', async () => {
  const { body } = await getHealth(createApp({ testMode: false, demoCopy: null }));
  assert.deepStrictEqual(body, { status: 'ok', testMode: false, demoCopy: null });
});
