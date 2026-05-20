#!/bin/bash
set -euo pipefail

echo "=== AI Company Tycoon Harness Initialization ==="
echo "Project: AI Company Tycoon: Boundaryless"
echo "Stack: Vite + React + TypeScript"
echo ""

if [ ! -d "node_modules" ]; then
  echo "=== Installing dependencies ==="
  npm install
fi

echo "=== Running full verification gate ==="
npm run harness:gate

echo ""
echo "=== Verification Complete ==="
echo "Next steps:"
echo "1. Read feature_list.json for current feature status"
echo "2. Read progress.md for blockers, files, and latest evidence"
echo "3. Work on one feature at a time"
echo "4. Re-run npm run harness:gate before claiming done"
