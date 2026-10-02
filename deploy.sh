#!/bin/bash
set -e
cd "$(dirname "$0")"

echo "=== Build ==="
npm run build

echo "=== Push main ==="
git add .
git commit -m "deploy $(date +%H:%M)" 2>/dev/null || true
git push origin main 2>/dev/null || true

echo "=== Push gh-pages ==="
cd dist
rm -rf .git
git init -q
git branch -M gh-pages
git add .
git commit -q -m "deploy $(date +%H:%M)"
git remote add origin https://github.com/SKZHPRVT/rally-tma.git 2>/dev/null || true
git push -f origin gh-pages

echo "=== Done! Открывай Telegram через 2 минуты ==="
