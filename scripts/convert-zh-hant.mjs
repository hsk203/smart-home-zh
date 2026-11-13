// Generate Traditional Chinese posts from Simplified ones (build-time).
// Reads src/content/posts/*.md (root only), converts frontmatter
// (title, description, tags) and body from Simplified to Traditional
// with opencc-js (cn -> tw), and writes src/content/posts/zh-Hant/*.md
// with lang: zh-Hant. The zh-Hant folder is generated and gitignored.
// Run manually with `pnpm i18n:zh-hant`; `pnpm build` runs it via prebuild.
import { readdir, readFile, writeFile, rm, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Converter } from "opencc-js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "src/content/posts");
const outDir = join(srcDir, "zh-Hant");
const convert = Converter({ from: "cn", to: "tw" });
const TEXT_FIELDS = new Set(["title", "description"]);

function convertTagsLine(line) {
  // tags: ["A", "B"] -> convert each quoted item
  return line.replace(/"([^"]*)"/g, (_m, s) => `"${convert(s)}"`);
}

async function main() {
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });
  const entries = await readdir(srcDir, { withFileTypes: true });
  const files = entries.filter((e) => e.isFile() && e.name.endsWith(".md"));
  let count = 0;
  for (const file of files) {
    const raw = await readFile(join(srcDir, file.name), "utf8");
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!match) {
      console.warn(`skip ${file.name}: no frontmatter`);
      continue;
    }
    const [, fm, body] = match;
    // Only convert Simplified Chinese posts (lang: zh-CN or missing).
    // English (lang: en) and other-language posts are skipped.
    const langMatch = fm.match(/^\s*lang:\s*(\S+)/m);
    if (langMatch && langMatch[1] !== "zh-CN") {
      continue;
    }
    const lines = fm.split(/\r?\n/).map((line) => {
      const m = line.match(/^(\s*)([A-Za-z]+):\s*(.*)$/);
      if (!m) return line;
      const [, indent, key, value] = m;
      if (key === "tags") return `${indent}tags: ${convertTagsLine(value)}`;
      if (TEXT_FIELDS.has(key)) {
        const q = value.match(/^"(.*)"$/);
        if (q)
          return `${indent}${key}: "${convert(q[1]).replace(/"/g, '\\"')}"`;
        return `${indent}${key}: ${convert(value)}`;
      }
      return line;
    });
    // Set lang: zh-Hant (add the key if missing, replace if present).
    const langIdx = lines.findIndex((l) => /^\s*lang:/.test(l));
    if (langIdx >= 0)
      lines[langIdx] = lines[langIdx].replace(/lang:\s*\S+/, "lang: zh-Hant");
    else lines.push("lang: zh-Hant");
    // Convert body, skipping fenced code blocks.
    const bodyOut = body
      .split(/(```[\s\S]*?```)/g)
      .map((part) => (part.startsWith("```") ? part : convert(part)))
      .join("");
    await writeFile(
      join(outDir, file.name),
      `---\n${lines.join("\n")}\n---\n${bodyOut}`,
      "utf8",
    );
    count += 1;
  }
  console.log(
    `zh-Hant: generated ${count} post(s) in src/content/posts/zh-Hant/`,
  );
}

await main();
