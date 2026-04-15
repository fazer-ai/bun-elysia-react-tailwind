import { describe, expect, test } from "bun:test";
import { extractInlineScriptHashes } from "@/api/lib/csp";

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
