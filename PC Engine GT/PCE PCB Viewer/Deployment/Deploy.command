#!/usr/bin/env bash
#
# PC Engine PCB Viewer — open the deployment console.
#
# This is the only double-clickable deployment file left in the repository. Everything the old
# Scripts folder did now happens in the console, where each value is shown before it is changed
# and no step can be run out of order. See Deployment/deploy.manifest.json for what it can do.
#
set -euo pipefail

# This file lives in Deployment/, so the repository root is its parent. Everything the console
# resolves — the .env files, the compose folders — is relative to that root.
cd "$(dirname "$0")/.."

if ! command -v deploy >/dev/null 2>&1; then
    echo "The deployment engine is not installed. Install it with:"
    echo
    echo "  dotnet tool install -g AngelSix.DeploymentEngine.Cli"
    echo
    read -r -p "Press return to close this window... " _
    exit 1
fi

deploy console --manifest Deployment/deploy.manifest.json
