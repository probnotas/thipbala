#!/usr/bin/env bash
# Serve the site locally. The frames are fetched over HTTP, so opening
# index.html straight off disk (file://) will not work.
#
#   ./tools/serve.sh [PORT]
set -euo pipefail

PORT="${1:-8080}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# Reuse the server if one is already up on this port.
if curl -s -o /dev/null --max-time 2 "http://localhost:$PORT/index.html"; then
  echo "already serving on port $PORT"
else
  nohup python3 -m http.server "$PORT" >/tmp/thipbala-serve.log 2>&1 &
  sleep 1
fi

LAN="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)"
echo
echo "  desktop : http://localhost:$PORT"
[ -n "$LAN" ] && echo "  phone   : http://$LAN:$PORT   (same wifi)"
echo
echo "  stop with: lsof -ti:$PORT | xargs kill"
