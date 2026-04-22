#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

if [[ ! -d .git ]]; then
  echo "Initializing git repo..."
  git init
fi

git add .

echo "Create initial commit if needed..."
if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
  git commit -m "feat: lockstep medical training H5 app" || true
else
  echo "Repository already has commits; staged changes are ready."
fi

echo "\nNext manual steps (requires your login):"
echo "1) Create a GitHub repo and add remote:"
echo "   git remote add origin <YOUR_GITHUB_REPO_URL>"
echo "2) Push code:"
echo "   git branch -M main"
echo "   git push -u origin main"
echo "3) In Cloudflare Pages: Create project -> connect repo -> build command empty -> output /"
