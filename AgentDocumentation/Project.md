# RetroSix Resources

Open-source hardware resources: PCB designs, KiCad libraries, SVG assets, documentation. MIT License.

## Sub-folders

- **KiCad/** — Symbol library (`.kicad_sym`)
- **PC Engine GT/** — PCB viewer (Node.js/Express, port 8080)
- **Game Boy Advance/**, **Game Gear/**, **SNES/** — PCB scans

## Build

- **PCB Viewer:** `node server.js` → `http://127.0.0.1:8080`
- **PCB Viewer tests:** `npm test` in `PC Engine GT/PCE PCB Viewer` (Node's built-in `node:test`, no extra dependencies)
- **PCB Viewer deployment:** `PC Engine GT/PCE PCB Viewer/Deployment/deploy.manifest.json` — a `production` profile and a `demo-live` profile (a stamped, test-mode demo copy that `sitehost demo` can put on a test machine; see `Deployment/Demo/README.md` there)
- **KiCad library:** Import via KiCad Preferences → Manage Symbol Libraries

For detailed asset listings and deep-dive documentation, see `AgentDocumentation/Overview.md`.
