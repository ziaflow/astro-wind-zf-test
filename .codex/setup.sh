#!/usr/bin/env bash
set -euo pipefail
# Select Node from .nvmrc in the saved Codex environment before running this script.
node --input-type=module -e '
const [major, minor] = process.versions.node.split(".").map(Number);
if (major !== 22 || minor < 22) throw new Error("Use Node 22.22.0 or newer 22.x; see .nvmrc");
'
test "$(npm --version)" = 10.9.4 || { echo 'Use npm 10.9.4 for the verified baseline.' >&2; exit 1; }
npm ci
npx playwright install chromium
# On a clean image, install browser OS libraries through the environment image/setup:
# npx playwright install --with-deps chromium (requires system package privileges).
