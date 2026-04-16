import { describe, expect, test } from "bun:test";
import { buildCspDirectives, extractInlineScriptHashes } from "@/api/lib/csp";

const sha256b64 = (content: string) =>
  new Bun.CryptoHasher("sha256").update(content).digest("base64");

describe("extractInlineScriptHashes", () => {
  test("hashes a single inline script", () => {
    const content = "console.log(1);";
    const hashes = extractInlineScriptHashes(`<script>${content}</script>`);
    expect(hashes).toEqual([`'sha256-${sha256b64(content)}'`]);
  });

  test("skips external scripts with src attribute", () => {
    const html = `<script src="x.js"></script><script>inline</script>`;
    const hashes = extractInlineScriptHashes(html);
    expect(hashes).toEqual([`'sha256-${sha256b64("inline")}'`]);
  });

  test("skips empty or whitespace-only scripts", () => {
    const html = `<script></script><script>   </script><script>real</script>`;
    const hashes = extractInlineScriptHashes(html);
    expect(hashes).toEqual([`'sha256-${sha256b64("real")}'`]);
  });

  test("emits distinct hashes for multiple distinct scripts", () => {
    const html = `<script>a()</script><script>b()</script>`;
    const hashes = extractInlineScriptHashes(html);
    expect(hashes).toHaveLength(2);
    expect(hashes[0]).not.toBe(hashes[1]);
  });

  test("handles scripts with attributes other than src", () => {
    const content = "noop";
    const html = `<script type="module" nonce="x">${content}</script>`;
    const hashes = extractInlineScriptHashes(html);
    expect(hashes).toEqual([`'sha256-${sha256b64(content)}'`]);
  });

  test("hash matches exact content (no trimming, case-sensitive)", () => {
    const content = "\n  let X = 1;\n";
    const hashes = extractInlineScriptHashes(`<script>${content}</script>`);
    expect(hashes[0]).toBe(`'sha256-${sha256b64(content)}'`);
  });
});

describe("buildCspDirectives", () => {
  test("baseline without hashes or CDN uses only self/data:", () => {
    const d = buildCspDirectives([], null);
    expect(d.scriptSrc).toEqual(["'self'"]);
    expect(d.styleSrc).toEqual(["'self'", "'unsafe-inline'"]);
    expect(d.imgSrc).toEqual(["'self'", "data:"]);
    expect(d.fontSrc).toEqual(["'self'", "data:"]);
    expect(d.connectSrc).toEqual(["'self'"]);
  });

  test("inline script hashes appear only in scriptSrc", () => {
    const d = buildCspDirectives(["'sha256-abc'", "'sha256-def'"], null);
    expect(d.scriptSrc).toEqual(["'self'", "'sha256-abc'", "'sha256-def'"]);
    expect(d.styleSrc).not.toContain("'sha256-abc'");
    expect(d.imgSrc).not.toContain("'sha256-abc'");
  });

  test("CDN origin is added to every asset-loading directive", () => {
    const d = buildCspDirectives([], "https://cdn.example.com");
    // NOTE: Regression guard for the original omission in styleSrc/fontSrc —
    // build.ts applies publicPath to every bundled asset (JS/CSS/fonts), so
    // each directive that governs an asset load must allow the CDN origin.
    expect(d.scriptSrc).toContain("https://cdn.example.com");
    expect(d.styleSrc).toContain("https://cdn.example.com");
    expect(d.imgSrc).toContain("https://cdn.example.com");
    expect(d.fontSrc).toContain("https://cdn.example.com");
    expect(d.connectSrc).toContain("https://cdn.example.com");
  });

  test("hashes and CDN compose without interfering", () => {
    const d = buildCspDirectives(["'sha256-x'"], "https://cdn.example.com");
    expect(d.scriptSrc).toEqual([
      "'self'",
      "'sha256-x'",
      "https://cdn.example.com",
    ]);
  });
});
