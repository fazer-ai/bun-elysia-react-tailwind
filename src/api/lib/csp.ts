import { readFileSync } from "node:fs";
import { join } from "node:path";
import logger from "@/api/lib/logger";
import config from "@/config";

const DIST_HTML = join(process.cwd(), "dist", "index.html");
const INLINE_SCRIPT_RE = /<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;

export function extractInlineScriptHashes(html: string): string[] {
  const hashes: string[] = [];
  for (const match of html.matchAll(INLINE_SCRIPT_RE)) {
    const content = match[1] ?? "";
    if (!content.trim()) continue;
    const digest = new Bun.CryptoHasher("sha256")
      .update(content)
      .digest("base64");
    hashes.push(`'sha256-${digest}'`);
  }
  return hashes;
}

function loadDistInlineScriptHashes(): string[] {
  if (config.env !== "production") return [];
  try {
    return extractInlineScriptHashes(readFileSync(DIST_HTML, "utf8"));
  } catch (err) {
    logger.warn(
      "CSP: could not read %s to compute inline script hashes (%s). Inline scripts will be blocked.",
      DIST_HTML,
      err instanceof Error ? err.message : String(err),
    );
    return [];
  }
}

function getCdnOrigin(): string | null {
  try {
    const origin = new URL(config.cdnUrl).origin;
    return origin === config.publicUrl ? null : origin;
  } catch {
    return null;
  }
}

const inlineScriptHashes = loadDistInlineScriptHashes();
const cdnOrigin = getCdnOrigin();

export const cspDirectives: Record<string, string[]> = {
  scriptSrc: [
    "'self'",
    ...inlineScriptHashes,
    ...(cdnOrigin ? [cdnOrigin] : []),
  ],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", "data:", ...(cdnOrigin ? [cdnOrigin] : [])],
  fontSrc: ["'self'", "data:"],
  connectSrc: ["'self'", ...(cdnOrigin ? [cdnOrigin] : [])],
};
