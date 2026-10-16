Not verified live 2026-10-16: written for plan 06 from `PC Engine GT/PCE PCB Viewer/server.js` and its package.json; not yet followed by --live. A resources repo; the one UI is the PC Engine GT PCB viewer.

## Start
- Install: `cd "PC Engine GT/PCE PCB Viewer" && (test -d node_modules || npm ci)`
- Start: `cd "PC Engine GT/PCE PCB Viewer" && node server.js </dev/null >/dev/null 2>&1 &` — serves the viewer on 127.0.0.1 (HOST and PORT from the environment, defaults 127.0.0.1 and 8080). The demo copy and test mode are both off by default, which the server requires to agree.

## URL
- http://127.0.0.1:8080/
- Port pinned: 8080 because `PC Engine GT/PCE PCB Viewer/server.js` falls back to it with process.env.PORT || 8080, a spelling no port scanner reads.

## Login or demo data
- None.

## Shot commands
- `guard shot page "http://127.0.0.1:8080/" --out "$TMPDIR/pce-viewer-before.png"` before the edit, `-after.png` after it; read both PNGs and the console-error list.
- Audit: `guard shot audit "http://127.0.0.1:8080" --route "/"`; when proving a change, add --expect-text with a string the change added.

## Teardown
- `lsof -ti tcp:8080 -sTCP:LISTEN | xargs kill 2>/dev/null || true` stops the viewer server and nothing else.
