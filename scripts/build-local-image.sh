#!/bin/sh
# Build the local NutriTrace image on a host without BuildKit/buildx.
#
# Upstream's Dockerfile opens with:
#     FROM --platform=$BUILDPLATFORM node:20-alpine AS build
# $BUILDPLATFORM is supplied by BuildKit. Under the classic builder it expands
# to the empty string and the build dies with "invalid OS component". It cannot
# be worked around with --build-arg either: it is a BuildKit-reserved arg.
#
# This used to be handled by keeping a hand-edited copy at Dockerfile.local.
# That copy silently missed every upstream change to the real Dockerfile --
# v1.2.0 added `COPY src/lib/nutrition.js` for the new MCP tools and the
# container crash-looped on startup until it was copied across by hand.
#
# Generating the file instead means upstream Dockerfile changes are picked up
# automatically and the only local deviation is the one line that has to differ.
#
# The better long-term fix is to install buildx and use ./Dockerfile directly.
set -eu
cd "$(dirname "$0")/.."

TAG="${1:-nutritrace:local-es}"
GEN=".Dockerfile.nobuildkit"
trap 'rm -f "$GEN"' EXIT

sed 's/^FROM --platform=\$BUILDPLATFORM /FROM /' Dockerfile > "$GEN"

if grep -q 'BUILDPLATFORM' "$GEN"; then
  echo "error: \$BUILDPLATFORM still present after rewrite -- upstream changed the FROM line" >&2
  exit 1
fi

echo "building $TAG from Dockerfile (--platform stripped)"
docker build -f "$GEN" -t "$TAG" .
