# Security Updates

Hosted site: `Boardview-pce.retrosix.co.uk`  
Hosted app path: `PC Engine GT/PCE PCB Viewer/`

## Current risk summary

- This is a very small static viewer, but it is currently served through an Express process instead of directly by Caddy.
- The Node server is minimal and only serves `/` plus `/assets`, which means there is not much app-layer risk, but there is also no need to keep a long-running app server here.
- The current Caddy route proxies to a local port instead of serving the files itself.

## Recommended updates

1. Replace the reverse proxy with direct static serving from Caddy.
   Use `root` + `file_server` against the viewer directory and remove the Express server from the public path.

2. If the Node server stays temporarily, bind it to localhost only and keep the public exposure entirely in Caddy.

3. Add simple Caddy headers.
   `X-Content-Type-Options`, `Referrer-Policy`, and a basic `Content-Security-Policy` are enough here.

4. Deny dotfiles and unexpected paths at the edge.
   This app should only need `/`, `/index.html`, and `/assets/*`.

## Good next step

This is a good candidate for pure Caddy static hosting. That removes the extra process entirely.
