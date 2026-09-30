# PC Engine PCB Viewer — demo copy

The `demo-live` profile in `../deploy.manifest.json` stands up a demo copy of the viewer beside
production: same code, its own container (`demolive-pce-boardview`), its own image tag and its own
loopback port (`DEMO_PORT`, default 8101). Site Host's `sitehost demo <site> <test machine>`
runs the same steps on another machine, through the profile's `demoCopy`.

## What a copy proves

The viewer holds no live data (no database, no uploads, no keys, no volume) and sends nothing, so
there is nothing to pull and nothing to scrub. A copy proves the release builds, starts and passes
its own tests on a clean machine, and that a demo image can never be run as, or mistaken for,
production. `demoCopy` therefore names steps only, with no backup `group` or `into` folder, the same
shape as MailBridge's.

## The guard: a stamp and a switch that must agree

- **The stamp** is `demo-copy.stamp`, written inside the image by `Dockerfile` here. Production's
  image never has one, and both dockerignore files keep a stray one out of the build context.
- **Test mode** is `PCE_VIEWER_TEST_MODE`, hard-wired to `"true"` in `docker-compose.demo.yml`.

`server.js` refuses to start when they disagree: the demo image with test mode off, or the
production image with test mode on, exits 1 with the sentence saying which. `/health` reports both
(`testMode`, `demoCopy`), and the profile's health checks read them. Test mode stubs nothing,
because the viewer has nothing outbound to stub.

## Steps

| Step | What it does |
|---|---|
| `demo-configure` | Writes `DEMO_PORT` to `Deployment/Demo/.env` (gitignored). |
| `demo-deploy` | Builds the demo image and starts it. Refused while `DEMO_PORT` equals the live `WEB_PORT`. |
| `demo-live-test` | `Scripts/demo-live-test.sh`: `/health` must show test mode and the stamp, the page and its script must be served, then the viewer's `node:test` suite runs inside the demo container. |
| `demo-stop` | Stops the demo container. Not part of `demoCopy`: a copy is left running. |

## Tests

`npm test` (from the viewer's folder) runs `Tests/server.test.js` with Node's built-in test runner:
the stamp and switch rules, the startup refusals in both directions, and `/health`.

## By hand

```bash
deploy run demo-configure --profile demo-live --set DEMO_PORT=8101
deploy run demo-deploy --profile demo-live
deploy run demo-live-test --profile demo-live
deploy health --profile demo-live
```
