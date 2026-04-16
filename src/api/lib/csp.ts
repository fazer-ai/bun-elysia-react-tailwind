import { join } from "node:path";
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

async function loadDistInlineScriptHashes(): Promise<string[]> {
  if (config.env !== "production") return [];
  try {
    return extractInlineScriptHashes(await Bun.file(DIST_HTML).text());
  } catch (err) {
    throw new Error(
      `CSP: could not read ${DIST_HTML} to compute inline script hashes (${
        err instanceof Error ? err.message : String(err)
      }). Run \`bun run build\` before starting the server in production.`,
    );
  }
}

function getCdnOrigin(): string | null {
  if (!config.cdnUrl) return null;
  let cdnOrigin: string;
  try {
    cdnOrigin = new URL(config.cdnUrl).origin;
  } catch {
    if (config.env === "production") {
      throw new Error(
        `CSP: invalid CDN_URL "${config.cdnUrl}". Expected an absolute URL so CSP can allow the CDN origin.`,
      );
    }
    return null;
  }
  // NOTE: Normalize both sides via URL so a trailing slash or path in
  // PUBLIC_URL does not cause a false mismatch against the CDN origin.
  let publicOrigin: string;
  try {
    publicOrigin = new URL(config.publicUrl).origin;
  } catch {
    return cdnOrigin;
  }
  return cdnOrigin === publicOrigin ? null : cdnOrigin;
}

export function buildCspDirectives(
  inlineScriptHashes: string[],
  cdnOrigin: string | null,
): Record<string, string[]> {
  const cdn = cdnOrigin ? [cdnOrigin] : [];
  return {
    scriptSrc: ["'self'", ...inlineScriptHashes, ...cdn],
    styleSrc: ["'self'", "'unsafe-inline'", ...cdn],
    imgSrc: ["'self'", "data:", ...cdn],
    fontSrc: ["'self'", "data:", ...cdn],
    connectSrc: ["'self'", ...cdn],
  };
}

const inlineScriptHashes = await loadDistInlineScriptHashes();
const cdnOrigin = getCdnOrigin();

export const cspDirectives = buildCspDirectives(inlineScriptHashes, cdnOrigin);
