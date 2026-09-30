# The DEMO image of the PCE PCB Viewer — the demo-live profile's viewer. The same code and the same
# steps as Deployment/Website/Dockerfile, plus one line: it is stamped as a demo copy.
#
# The stamp is half of the viewer's demo guard. server.js refuses to start stamped without test mode
# (PCE_VIEWER_TEST_MODE, hard-wired on by docker-compose.demo.yml) and refuses test mode without a
# stamp, so this image cannot be run as production and production's image cannot be run as a demo.
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Written after COPY, so no stamp from the build context can be what counts; the dockerignore keeps
# a stray one out of both images anyway.
ARG DEMO_COPY=demolive-pce-boardview
RUN test -n "$DEMO_COPY" && printf '%s\n' "$DEMO_COPY" > demo-copy.stamp

EXPOSE 8080

ENV PORT=8080
ENV HOST=0.0.0.0

CMD ["node", "server.js"]
