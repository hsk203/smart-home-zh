// Generate Traditional Chinese build inputs from Simplified ones.
// - Converts the 8 Koharu-format posts in src/content/blog/*.md
//   (title, description, tags, categories, body) and writes them to
//   src/content/blog-hant/*.md
// - Converts config/site.yaml -> config/site-hant.yaml (site.url is swapped
//   to the zh-Hant domain after conversion)
// - Converts src/i18n/translations/zh.ts -> src/i18n/translations/zh-hant.ts
// - Converts src/pages/about.md -> src/pages/about-hant.md
// - Converts src/pages/privacy.astro -> src/pages/privacy-hant.astro
// Whole-file conversion is safe for the yaml/ts/md/astro files: code, keys,
// URLs and paths are ASCII, only Chinese string values change.
// Run manually with `pnpm i18n:zh-hant`; `bash scripts/build-all.sh` runs it.
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Converter } from 'opencc-js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const convert = Converter({ from: 'cn', to: 'tw' });
const TEXT_FIELDS = new Set(['title', 'description']);

function convertQuotedList(line) {
  // tags: ["A", "B"] / categories list items handled separately; convert each quoted item
  return line.replace(/"([^"]*)"/g, (_m, s) => `"${convert(s)}"`);
}

async function convertPost(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error('post without frontmatter');
  const [, fm, body] = match;
  const lines = fm.split(/\r?\n/).map((line) => {
    const m = line.match(/^(\s*)(- )?([A-Za-z]+)?:?\s*(.*)$/);
    if (!m) return line;
    const [, indent, dash, key, value] = m;
    // categories list item: "  - 跨区折腾"
    if (dash && !key) return `${indent}- ${convert(value)}`;
    if (!key) return line;
    if (key === 'tags') return `${indent}tags: ${convertQuotedList(value)}`;
    if (TEXT_FIELDS.has(key)) {
      const q = value.match(/^"(.*)"$/);
      if (q) return `${indent}${key}: "${convert(q[1]).replace(/"/g, '\\"')}"`;
      return `${indent}${key}: ${convert(value)}`;
    }
    return line;
  });
  // Convert body, skipping fenced code blocks.
  const bodyOut = body
    .split(/(```[\s\S]*?```)/g)
    .map((part) => (part.startsWith('```') ? part : convert(part)))
    .join('');
  return `---\n${lines.join('\n')}\n---\n${bodyOut}`;
}

async function convertWholeFile(src, dst, urlSwap) {
  let text = await readFile(src, 'utf8');
  text = convert(text);
  if (urlSwap) text = text.replaceAll(urlSwap[0], urlSwap[1]);
  await writeFile(dst, text, 'utf8');
}

async function main() {
  // 1. posts
  const srcDir = join(root, 'src/content/blog');
  const outDir = join(root, 'src/content/blog-hant');
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });
  const entries = await readdir(srcDir, { withFileTypes: true });
  const files = entries.filter((e) => e.isFile() && e.name.endsWith('.md'));
  let count = 0;
  for (const file of files) {
    const raw = await readFile(join(srcDir, file.name), 'utf8');
    await writeFile(join(outDir, file.name), await convertPost(raw), 'utf8');
    count += 1;
  }
  console.log(`zh-Hant: generated ${count} post(s) in src/content/blog-hant/`);

  // 2. site.yaml (swap URL after conversion)
  await convertWholeFile(join(root, 'config/site.yaml'), join(root, 'config/site-hant.yaml'), [
    'https://smarthome.aitech8.com',
    'https://smarthome-hant.aitech8.com',
  ]);
  console.log('zh-Hant: generated config/site-hant.yaml');

  // 3. UI strings
  await convertWholeFile(join(root, 'src/i18n/translations/zh.ts'), join(root, 'src/i18n/translations/zh-hant.ts'));
  console.log('zh-Hant: generated src/i18n/translations/zh-hant.ts');

  // 4. about + privacy
  await convertWholeFile(join(root, 'src/pages/about.md'), join(root, 'src/pages/about-hant.md'));
  await convertWholeFile(join(root, 'src/pages/privacy.astro'), join(root, 'src/pages/privacy-hant.astro'));
  console.log('zh-Hant: generated about-hant.md + privacy-hant.astro');
}

await main();
