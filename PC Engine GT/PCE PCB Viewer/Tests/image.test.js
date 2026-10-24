// The two images' runtime, pinned (2026-10-24 security sweep): Node 18 has been end of life since
// April 2025, and both images ran as root. Inside the deployed demo container the Dockerfiles are
// not copied in, so there these checks have nothing to read and skip.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const deployment = path.join(__dirname, '..', 'Deployment');
const images = ['Website/Dockerfile', 'Demo/Dockerfile'].map((name) => path.join(deployment, name));

for (const image of images) {
  const name = path.relative(deployment, image);
  const skip = !fs.existsSync(image) && 'Dockerfiles are not in this image';

  test(`${name} builds on a supported Node`, { skip }, () => {
    const from = fs.readFileSync(image, 'utf8').match(/^FROM\s+node:(\d+)/m);
    assert.ok(from, 'no FROM node:<major> line');
    assert.ok(Number(from[1]) >= 22, `node:${from[1]} is not a supported LTS`);
  });

  test(`${name} runs as the node user, not root`, { skip }, () => {
    const users = fs.readFileSync(image, 'utf8').split('\n').map((l) => l.trim()).filter((l) => /^USER\s/i.test(l));
    assert.ok(users.length > 0, 'no USER line');
    assert.strictEqual(users.at(-1).split(/\s+/)[1], 'node');
  });
}
