import { type Dirent, promises as fs } from "node:fs";
import path from "node:path";

import { name } from "@/../package.json";

const ROOT = process.cwd();
const REPO_NAME = path.basename(ROOT);
const SEARCH = name;
const IGNORES = new Set([
  "node_modules",
  ".git",
  ".venv",
  "dist",
  "build",
  "tmp",
  "logs",
  "public",
  ".next",
  "out",
]);

async function walk(dir: string): Promise<string[]> {
  let results: string[] = [];
  let entries: Dirent[];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const e of entries) {
    if (IGNORES.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      results = results.concat(await walk(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

async function main() {
  const files = await walk(ROOT);
  let fileCount = 0;
  let replaceCount = 0;
  for (const file of files) {
    const rel = path.relative(ROOT, file);
    try {
      const content = await fs.readFile(file, "utf8");
      if (content.includes(SEARCH)) {
        const replaced = content.split(SEARCH).join(REPO_NAME);
        await fs.writeFile(file, replaced, "utf8");
        console.log(`Updated: ${rel}`);
        fileCount++;
        const occurrences = (content.match(new RegExp(SEARCH, "g")) || [])
          .length;
        replaceCount += occurrences;
      }
    } catch {
      // skip binary/unreadable files
    }
  }

  console.log(
    `Done — modified ${fileCount} file(s), replaced ${replaceCount} occurrence(s).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
