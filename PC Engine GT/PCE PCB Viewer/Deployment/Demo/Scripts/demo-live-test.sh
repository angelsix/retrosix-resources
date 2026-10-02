#!/usr/bin/env bash
# demo-live-test: the site's tests against the running demo viewer.
#
#  1. The running demo PROVES it is a demo copy: /health reports test mode on and the demo stamp.
#  2. It serves the viewer page and its script.
#  3. The viewer's own test suite runs INSIDE the deployed demo container, against the image that is
#     serving, so a target machine needs Docker and curl but not Node.
# Nothing in this script reaches anything but the demo container on loopback.
set -euo pipefail

repo="$(cd "$(dirname "$0")/../../.." && pwd)"
env_file="$repo/Deployment/Demo/.env"

# A missing file or key reads as blank, and the blank falls back to the compose default.
read_env() { { grep -E "^$1=" "$2" 2>/dev/null || true; } | tail -1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//'; }
port="$(read_env DEMO_PORT "$env_file")"; port="${port:-8101}"
live_port="$(read_env WEB_PORT "$repo/Deployment/Website/.env")"; live_port="${live_port:-8001}"

if [[ "$port" == "$live_port" ]]; then
  echo "FAIL: DEMO_PORT is the live viewer's port ($live_port)."; exit 1
fi

health="$(curl -fsS "http://127.0.0.1:$port/health")" || { echo "FAIL: demo viewer not answering on $port"; exit 1; }
echo "health: $health"
grep -q '"testMode":true' <<<"$health" || { echo "FAIL: the demo viewer is not in test mode"; exit 1; }
grep -q '"demoCopy":"demolive-pce-boardview"' <<<"$health" || { echo "FAIL: the demo viewer is not stamped as a demo copy"; exit 1; }
echo "PASS: the demo viewer reports test mode on and the demo stamp"

page="$(curl -fsS "http://127.0.0.1:$port/")" || { echo "FAIL: the viewer page did not load"; exit 1; }
grep -q 'assets/panzoom.js' <<<"$page" || { echo "FAIL: the viewer page does not load its script"; exit 1; }
curl -fsS -o /dev/null "http://127.0.0.1:$port/assets/panzoom.js" || { echo "FAIL: the viewer script is not served"; exit 1; }
echo "PASS: the viewer page and its script are served"

docker exec -w /app demolive-pce-boardview node --test
