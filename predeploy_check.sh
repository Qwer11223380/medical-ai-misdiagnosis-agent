#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

echo "[1/4] Checking required files..."
required=(index.html styles.css app.js DEPLOY_PUBLIC.md)
for f in "${required[@]}"; do
  if [[ ! -f "$f" ]]; then
    echo "Missing file: $f"
    exit 1
  fi
done

echo "[2/4] Running JavaScript syntax check..."
if command -v node >/dev/null 2>&1; then
  node --check app.js
else
  echo "node not found, skip syntax check"
fi

echo "[3/4] Checking case files presence..."
assets=(
  "患者初诊.pdf"
  "患者复诊.pdf"
  "肿瘤病例.pdf"
  "诊断复盘.pdf"
  "迁移应用.pdf"
  "任务引擎应用案例.docx"
  "肿瘤病例.docx"
  "附件1医学教育智能体及应用案例申报书docx.docx"
  "Picture.png"
  "Picture2.png"
)
for f in "${assets[@]}"; do
  if [[ ! -f "$f" ]]; then
    echo "Warning: missing asset $f"
  fi
done

echo "[4/4] Local preview command"
echo "Run: python3 -m http.server 8000"
echo "Open: http://localhost:8000/index.html"

echo "Predeploy check passed."
