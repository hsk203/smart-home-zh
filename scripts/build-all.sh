#!/usr/bin/env bash
# Two-locale build for smart-home-zh (Koharu).
# 1. Build zh-CN from the canonical files -> dist-zh-cn/
# 2. Generate zh-Hant inputs, swap them in, build -> dist-zh-hant/
# 3. Restore the zh-CN files.
# Uses `pnpm astro build` directly (skips `pnpm koharu migrate --check`,
# which is a legacy-data migration check, not a build step).
set -euo pipefail
cd "$(dirname "$0")/.."
export PATH="$HOME/workspace/.local/bin:$PATH"

SWAP_DIR=".hant-swap"

restore() {
  if [ -d "$SWAP_DIR" ]; then
    echo "restoring zh-CN files..."
    [ -d "$SWAP_DIR/blog-zh-cn" ] && rm -rf src/content/blog && mv "$SWAP_DIR/blog-zh-cn" src/content/blog
    [ -f "$SWAP_DIR/site.yaml" ] && cp "$SWAP_DIR/site.yaml" config/site.yaml
    [ -f "$SWAP_DIR/zh.ts" ] && cp "$SWAP_DIR/zh.ts" src/i18n/translations/zh.ts
    [ -f "$SWAP_DIR/about.md" ] && cp "$SWAP_DIR/about.md" src/pages/about.md
    [ -f "$SWAP_DIR/privacy.astro" ] && cp "$SWAP_DIR/privacy.astro" src/pages/privacy.astro
    rm -rf "$SWAP_DIR"
  fi
}
trap restore EXIT

# --- zh-CN ---
echo "== building zh-CN =="
pnpm build
rm -rf dist-zh-cn && mv dist dist-zh-cn

# --- generate zh-Hant inputs ---
node scripts/convert-zh-hant.mjs

# --- swap in zh-Hant files ---
mkdir -p "$SWAP_DIR"
cp config/site.yaml "$SWAP_DIR/site.yaml"
cp src/i18n/translations/zh.ts "$SWAP_DIR/zh.ts"
cp src/pages/about.md "$SWAP_DIR/about.md"
cp src/pages/privacy.astro "$SWAP_DIR/privacy.astro"
mv src/content/blog "$SWAP_DIR/blog-zh-cn"

cp config/site-hant.yaml config/site.yaml
cp src/i18n/translations/zh-hant.ts src/i18n/translations/zh.ts
cp src/pages/about-hant.md src/pages/about.md
cp src/pages/privacy-hant.astro src/pages/privacy.astro
mv src/content/blog-hant src/content/blog

# --- zh-Hant ---
echo "== building zh-Hant =="
pnpm build
rm -rf dist-zh-hant && mv dist dist-zh-hant

# --- restore (also runs via trap) ---
restore
trap - EXIT
echo "DONE: dist-zh-cn/ + dist-zh-hant/"
