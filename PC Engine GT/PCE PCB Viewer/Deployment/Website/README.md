# PC Engine PCB Viewer — deployment

Driven by the deployment console: double-click `Deployment/Deploy.command`. This folder holds what
the console runs; `../deploy.manifest.json` describes it, and each step's `why` is where the
reasoning lives.

Note that this project's root is the viewer's own folder, not `retrosix-resources`. That repository
holds board scans, KiCad projects and documentation for a dozen consoles; only this corner of it is
a hosted site.

## Files

- `docker-compose.yml` — the one container, published on one host address.
- `Dockerfile` — `node:18-alpine`, `npm ci`, `COPY . .`, `node server.js`.
- `Dockerfile.dockerignore` — what stays out of the build context.
- `.env` / `.env.example` — the port and bind address. `.env` is gitignored.

## The two addresses, which are different decisions

`HOST=0.0.0.0` is set **inside** the container. `server.js` defaults to `127.0.0.1`, which in a
container means the container's own loopback — nothing published could reach it.

`WEB_BIND_ADDRESS` is the address on the **host**, and it is `127.0.0.1` on purpose. The compose
file used to publish `8001:8080`, which binds every interface and puts the viewer on the LAN
directly, around the Caddy that terminates its TLS. Site Host's rule is that a site container
publishes to loopback only and Caddy is the sole LAN listener.

Changing one of these to match the other breaks it in one direction or the other, so they are named
differently and this section exists.

## What is baked in

The image is single-stage and does `COPY . .`, so anything left in the build context is baked into
what the server serves. `Dockerfile.dockerignore` is what keeps secrets and local state out of it,
and `guard security web-exposure` gates that. Nothing is bind-mounted and nothing persists outside
the image, so a redeploy is a new image and nothing else — there is nothing to back up first.

## By hand

```bash
cd Deployment/Website
docker compose up -d --build
docker compose down
```
