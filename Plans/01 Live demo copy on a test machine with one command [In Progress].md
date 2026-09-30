# Live demo copy on a test machine with one command
Status: IN PROGRESS
Priority: 3/5
Plan type: code
Plan style: solo
Bring the PCE PCB Viewer onto Site Host's one-line live demo copy, so `sitehost demo` can stand a safe, test-mode copy of it up on a test machine.
## The plan
**The idea:**
Luke can now type one line, `sitehost demo <site> <test machine>`, and get a demo-only copy of a site running on a test machine with its own tests passed and one verdict back. OrderBooks, CleanPay, RetroSix Auth and MailBridge already support it; MailBridge shows the shape for a site with no live data to copy, where the copy starts empty. This plan brings the PCE PCB Viewer (it lives in `PC Engine GT/PCE PCB Viewer` inside this repo) to the same standard.

Its manifest (`PC Engine GT/PCE PCB Viewer/Deployment/deploy.manifest.json`) currently says it has no demo-live profile because it holds nothing live: everything is baked into the image. With the new mechanism a copy that fetches nothing is still worth having: it proves the release stands up and passes its tests on a clean machine. Test mode here means nothing extra, since it sends nothing. If surveying the code shows a real reason this is not worth doing, say so to Luke rather than forcing it.

Reference material, all on this machine: the engine's "Demo from live" and `demoCopy` sections in `site-host-server/Source/DeploymentEngine/README.md`; OrderBooks' worked example in `orderbooks/Documentation/DemoFromLive.md` and its `demo-live` profile in `orderbooks/Deployment/deploy.manifest.json` (CleanPay, RetroSix Auth and MailBridge carry the same; MailBridge is the no-data shape); and Site Host's plan `site-host-server/Plans/01 Put a live copy of a site on a test machine with one command [In Progress].md`. Lint with `site-host-server/Source/DeploymentEngine/Scripts/demo-live-sweep.sh <this repo>`, which builds the engine from that checkout.

**Rough approach:**
Follow MailBridge's no-data shape. A standalone demo stack in `Deployment/Demo` (its own Dockerfile, compose file, container `demolive-pce-boardview`, loopback port that is not production's), with the viewer's test mode hard-wired on. The demo image carries a stamp file saying it is a demo copy; production's never does. At startup the viewer refuses a stamp without test mode and test mode without a stamp, and `/health` reports both so the profile's health checks and the demo test script can read them.

The `demo-live` profile runs configure, deploy, test, with a `demoCopy` naming those three steps and no group or folder, because there is nothing live to fetch. The tests run inside the deployed container, so a target machine only needs Docker and curl.

A small `node:test` suite is added (no new dependencies) and wired into `npm test`.

**Findings:**
Surveyed 2026-09-30 against the tracked files in `PC Engine GT/PCE PCB Viewer` (`git ls-files .`: server.js, index.html, assets/panzoom.js, Scripts/run.py, run.bat, package.json, package-lock.json, the Deployment folder).

**It sends nothing.** `server.js` is an Express static server: it serves `index.html` and `/assets` (four board scans and `panzoom.js`) behind a strict CSP (`default-src 'self'`, `script-src 'self'`), so even the browser page cannot load or call anything off-site. The only runtime dependency is `express` (lockfile v1: express and its own dependencies, no HTTP client, no mailer). No database, no uploads, no keys, no volume, no bind mount. The proving grep, over every tracked code file:

```
PAT='fetch\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|https?\.request|https?\.get\(|require\(.(https?|net|dgram|tls|child_process|nodemailer|axios)|<script[^>]+src=.https?:|<link[^>]+href=.https?:|analytics|gtag|googletagmanager|smtp|mailto:'
grep -nEi "$PAT" server.js index.html assets/panzoom.js Scripts/run.py run.bat Deployment/Website/Dockerfile Deployment/Website/docker-compose.yml
exit=1   (no match)
```

Positive control: the same grep over copies of `server.js` and `index.html` with `fetch('https://example.com/x')` and a CDN `<script src="https://cdn...">` planted matched both lines (exit 0). So the negative is a real one. `Scripts/run.py` only runs a local `http.server` for development.

**What the other sites do, read from their code.** OrderBooks has two layers that must agree: data scrubbed and stamped (a `DemoCopy` table) and the app's `DemoMode`, and `DemoCopyStamp` refuses to start when they disagree. MailBridge has no data: its demo is a standalone compose file (`Deployment/Demo/docker-compose.demo.yml`, not an overlay) with `MAILBRIDGE_TEST_MODE` hard-wired to a literal `"true"`, its own container, port and volume; `/health` reports `testMode`, and the profile's health checks read it plus the container's env. Its `demoCopy` names steps only, no `group` or `into`, and the copy starts empty. That is the shape here.

**The viewer has no data layer to carry a stamp**, so the stamp goes where this site's state lives: the image. A demo image built from its own Dockerfile carries a stamp file; production's image never does. Test mode is the runtime switch set by the demo compose. They come from different places (build time and run time), so they can disagree, and the app refuses to start when they do. Test mode itself changes nothing the viewer does, because there is nothing to stub.

**Site Host plan 01's target run** answers step questions itself (spare ports, confirmations), so a demo port setting with a default is enough for `demo-configure`. A target has Docker and curl but not necessarily Node, so the site's tests run inside the deployed demo container (`node:18-alpine` has `node --test`).

**No test suite before this plan**: `package.json` `test` was the npm placeholder that exits 1.

**Decisions taken while Luke was away (2026-09-30), each the safest option; say if any is wrong.**
- The stamp is a file (`demo-copy.stamp`) written inside the demo image by `Deployment/Demo/Dockerfile`, not an environment variable, so run-time config cannot fake or remove it. Both dockerignore files exclude it so a stray one never reaches production.
- The demo is a standalone compose file, not an overlay, matching MailBridge: its own container `demolive-pce-boardview`, image tag and loopback port `DEMO_PORT` (default 8101). `demo-deploy` is refused while `DEMO_PORT` equals `WEB_PORT`.
- `/health` is new on production too (reports `testMode: false, demoCopy: null`). It exposes nothing sensitive and gives the profiles something to read.
- Both dockerignore files now also exclude `**/.env`. The old `.env` line only matched the context root, so `Deployment/Website/.env` (ports only, never served) was baked into the production image. Proved: after the change, `ls -a Deployment/Website | grep -c '^.env$'` in the rebuilt production image prints 0.
- Tests live in `Tests/` (guard name check refuses lowercase `test`); `node --test` finds `Tests/server.test.js` in both Node 18 (the image) and Node 26 (this Mac).
- Production's compose healthcheck was left for Luke, who then said fix it (see Open questions).

**Found while building: production's healthcheck can never pass.** In `node:18-alpine`, `localhost` resolves to `::1` first and the server listens on IPv4 only, so `wget --spider http://localhost:8080/` is refused. Probe against a freshly built production image: `localhost exit=1` ("Connecting to localhost:8080 ([::1]:8080) ... Connection refused"), `127.0.0.1 exit=0`. The demo compose uses `127.0.0.1` and its container turns healthy; with `localhost` it timed out after 300s.

**Open questions:**
- Resolved (2026-09-30): is it worth doing when the viewer sends nothing? Yes. A copy proves the release builds, starts and passes its own tests on a clean machine, and the stamp and switch agreement keeps a demo image from ever being mistaken for production, or run as it. Built by tasks 1 and 2.
- Resolved (2026-09-30): where does the stamp live with no database? In the demo image, written by the demo Dockerfile, and never in production's (task 1).
- Resolved (2026-09-30, Luke): fix production's healthcheck? Yes. `Deployment/Website/docker-compose.yml` now probes `http://127.0.0.1:8080/health`. Before, in a running production container: `localhost` probe exit=1 (Connection refused on [::1]); after, the production stack turned `healthy` (health log: `Connecting to 127.0.0.1:8080 ... remote file exists`, ExitCode 0).
- Resolved (2026-09-30, Luke): freeze a change-gate baseline? Yes. `guard change freeze .` froze 536 files into `.guard/baseline.json`; `guard change gate .` passes (2 answered, 536 frozen). Refusing case: appending a line to the frozen `Game Development/GB/Resources/gbdk-mac/examples/ap/colorbar/bar_c.h` made the gate exit 1 naming that file; restored, it passes again.
- Resolved (2026-09-30): where do the site's tests run on a target? Inside the deployed demo container, so the target needs no Node (task 2).

- Resolved (2026-09-30): the viewer's site id on Site Host is `pce-pcb-viewer`. Site Host takes a site's id from its manifest's `project.id` when the site is added (`site-host-server/Source/src/SiteHost/Endpoints/SiteEndpoints.cs:608`), and the demo target refuses a manifest whose `project.id` differs from the site id it was asked for (`DemoCopyTarget.cs:294`). The four sites already on webby match: `mail-bridge`, `clean-pay`, `orderbooks`, `retrosix-auth`. So task 4's line is `sitehost demo pce-pcb-viewer sitehost-proof`.

**Resume notes:**
Tasks 1 to 3 are built and proved (2026-09-30). Only task 4 is left, and it waits on two things outside this repo:

1. The viewer hosted on Site Host (webby). Today it is not, so there is no site for `sitehost demo` to name. Add it on webby from this repo, with the viewer's folder (`PC Engine GT/PCE PCB Viewer`) as the project root, since that is where the manifest lives.
2. Site Host plan 01 (`site-host-server/Plans`, "Put a live copy of a site on a test machine with one command") finished, including pairing sitehost-proof as a named host.

Then run `sitehost demo pce-pcb-viewer sitehost-proof`. Expect: demo-configure, demo-deploy and demo-live-test as one job, then the profile's four health checks; the verdict is healthy only if `/health` on the demo port reports `testMode: true` and `demoCopy: demolive-pce-boardview`. Nothing is fetched from the live host (no group), so a failure there is a pairing or install problem, not data.

## Tasks
- [x] 1. Make the viewer (`PC Engine GT/PCE PCB Viewer/server.js`) know it is a demo copy: a stamp baked into the demo image only, a test-mode switch set by the demo stack, startup refusing either without the other, and health reporting both. The survey found nothing outbound to stub. [risk: high]
    - Done when: named node:test tests in a new viewer test suite go red before the change and green after: a stamp without test mode and test mode without a stamp each make startup exit non-zero naming the mismatch, and /health reports testMode and the stamp
    - Evidence (2026-09-30): 2026-09-30. RED before server.js changed: node --test on Tests/server.test.js: tests 9, pass 1, fail 7 (readDemoState/createApp not a function; requiring server.js started a listener and hung 30s). GREEN after: npm test: tests 9, pass 9, fail 0 (A demo stamp without test mode is a mismatch; Test mode without a demo stamp is a mismatch; A blank stamp does not count as a stamp; Production and a stamped demo in test mode both agree; Startup refuses test mode on an unstamped viewer; Startup refuses a demo stamp without test mode; Startup serves production and a stamped demo in test mode; Health reports test mode and the demo stamp; Health on production reports no test mode and no stamp). Mutations: refusal disabled (if (false && mismatch)) -> fail 2, both startup refusals; stamp-without-test-mode branch removed -> fail 1; /health testMode hard-coded true -> fail 1; restored -> pass 9. Real images: demo image with PCE_VIEWER_TEST_MODE=false -> 'Refusing to start: This viewer is stamped as a demo copy (demo-copy.stamp: demolive-pce-boardview) but test mode is off...' exit=1; production image with PCE_VIEWER_TEST_MODE=true -> 'Refusing to start: PCE_VIEWER_TEST_MODE is on (test mode is on) but this viewer is not stamped as a demo copy (no demo-copy.stamp)...' exit=1. Outbound: survey grep exit=1 with positive control exit=0 (plan Findings), so nothing to stub.
- [x] 2. Add the standalone demo stack and the demo-live profile (low danger, own container and port) with configure, deploy and test steps, and a demoCopy naming those steps with no group. [risk: low]
    - Done when: the demoCopy steps run locally with deploy run bring up the demo container, its test step passes and deploy health for demo-live exits 0; demo-live-sweep.sh over this repo passes and fails with 'declares no demo copy' when the demoCopy line is removed
    - Evidence (2026-09-30): 2026-09-30, Docker 29.8.0 on this Mac. deploy run demo-configure/demo-deploy/demo-live-test --profile demo-live: exit 0, 0, 0 ('demolive-pce-boardview is healthy.'; test step: 'PASS: the demo viewer reports test mode on and the demo stamp', 'PASS: the viewer page and its script are served', in-container node 18 suite '# tests 9 # pass 9 # fail 0'). deploy health --profile demo-live: 'HEALTHY — all 4 check(s) pass.' exit 0. demo-live-sweep.sh /Users/lukemalpass/Documents/GitHub/retrosix-resources: 'ok ... (demo-live profile; PASS deploy.manifest.json — 6 step(s), 2 profile(s).)' 'PASS all 1 manifest(s) answer demo-live and lint clean.' exit=0. Refusing case: demoCopy line deleted -> 'FAIL ... warning: profiles[demo-live].demoCopy: declares no demo copy, so this site cannot be copied to a test machine.' 'FAIL 1 of 1 manifest(s).' exit=1; restored -> deploy lint PASS exit=0. Port guard: DEMO_PORT=8001 (= WEB_PORT) -> demo-deploy 'DEMO_PORT is 8001, the same as the value it must not share.' exit=1, demo-live-test.sh 'FAIL: DEMO_PORT is the live viewer's port (8001).' exit=1.
- [x] 3. Remove the demoLive reason from the viewer manifest, which a demo-live profile makes an error, document the demo copy beside the other deployment docs, and name the new test command in `AgentDocumentation/Project.md`. [risk: low]
    - Done when: deploy lint on the viewer's manifest exits 0 with no demoLive or demoCopy line, and fails when the old demoLive reason is put back beside the profile
    - Evidence (2026-09-30): 2026-09-30. With the demo-live profile added and the old reason still present: deploy lint -> 'error: demoLive: says why there is no demo-live profile, but the manifest declares one. Keep one answer.' 'FAIL deploy.manifest.json — 1 error(s).' exit=1. Reason removed: deploy lint -> 'PASS deploy.manifest.json — 6 step(s), 2 profile(s).' exit=0, no demoLive or demoCopy line. Docs: new Deployment/Demo/README.md, pointer in Deployment/Website/README.md and in the manifest's project links, npm test and the demo-live profile named in AgentDocumentation/Project.md. guard docs symbols . PASS; guard docs plan-refs . PASS; removed-identifier sweep: 6 candidates, 0 gone.
- [ ] 4. Waiting on the viewer being hosted on Site Host (webby) and Site Host plan 01 finishing: then `sitehost demo` it to the sitehost-proof VM and read the verdict. [risk: high]
    - Done when: 🚧 needs the site on webby and Site Host plan 01 finished: `sitehost demo <site> sitehost-proof` exits 0 with a healthy verdict

## Feedback notes
{{Optional: consolidate live testing feedback here before folding it back into tasks/decisions.}}

## Decisions and trade-offs

## Pinned terms

## Agent activity log
- 2026-09-30: Guard review receipts cleared by `guard plan set-section` because section `The plan` changed.
- 2026-09-30: Guard review receipts cleared by `guard plan set-section` because section `The plan` changed.
- 2026-09-30: Task 4 edited by `guard plan edit-task`.
- 2026-09-30: Tasks marked done by `guard plan mark-done`.
- 2026-09-30: Tasks marked done by `guard plan mark-done`.
- 2026-09-30: Tasks marked done by `guard plan mark-done`.
- 2026-09-30: Guard review receipts cleared by `guard plan set-section` because section `The plan` changed.
- 2026-09-30: Task 2 edited by `guard plan edit-task`.
- 2026-09-30: Task 3 edited by `guard plan edit-task`.
- 2026-09-30: Task 3 edited by `guard plan edit-task`.
- 2026-09-30: Task 1 edited by `guard plan edit-task`.
- 2026-09-30: Task 1 edited by `guard plan edit-task`.
- 2026-09-30: Status changed from `BRAINSTORMING` to `IN PROGRESS` by `guard plan set-status`.
- 2026-09-30: Task 1 edited by `guard plan edit-task`.
- 2026-09-30: Task 3 edited by `guard plan edit-task`.
- 2026-09-30: Task 2 edited by `guard plan edit-task`.
- 2026-09-30: Task 1 edited by `guard plan edit-task`.
- 2026-09-30: Guard review receipts cleared by `guard plan set-section` because section `Open questions` changed.
- 2026-09-30: Guard review receipts cleared by `guard plan set-section` because section `Rough approach` changed.
- 2026-09-30: Guard review receipts cleared by `guard plan set-section` because section `Findings` changed.
- 2026-09-30: Added 4 task(s) by `guard plan add-tasks`.
- 2026-09-30: Guard review receipts cleared by `guard plan set-section` because section `The idea` changed.

## Model authorship
- 2026-09-30: claude-opus-5-5 — created plan, set section "The idea", added 4 tasks, set section "Findings", set section "Rough approach", set section "Open questions", edited task 1, edited task 2, edited task 3, set status to IN PROGRESS, set section "The plan", marked tasks done, edited task 4
