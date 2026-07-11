#!/usr/bin/env node
/**
 * Design-token guard. Fails if a raw Tailwind palette colour (e.g. text-green-600,
 * bg-amber-100) or a hard-coded hex colour appears in pages/ or components/.
 * Use the semantic tokens instead: success / warning / info / destructive /
 * primary / accent / muted / foreground / border / card (and brand-* for the
 * fixed marketing brand colours).
 *
 * Run: `pnpm verify:tokens` (or `node scripts/check-tokens.mjs`).
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOTS = ["src/pages", "src/components"];

// Files allowed to keep raw palette/hex:
// - StudentAvatar / StaffRoomPage: decorative per-identity avatar colours
//   (hash-selected multi-hue sets that are intentionally not semantic).
// - chart.tsx: vendored shadcn primitive; its hex lives in a recharts CSS
//   selector (`[stroke=#ccc]`), not an app colour we tokenize.
const ALLOW = new Set([
  "src/components/ui/StudentAvatar.tsx",
  "src/pages/staffroom/StaffRoomPage.tsx",
  "src/components/ui/chart.tsx",
]);

const PALETTE =
  /\b(?:text|bg|border|ring|from|to|via|fill|stroke|decoration|outline|divide|placeholder|accent|caret|shadow)-(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-(?:50|100|200|300|400|500|600|700|800|900|950)\b/;
const HEX = /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/;
// Arbitrary-value literal colours like bg-[#abc] or text-[rgb(...)]/[hsl(...)].
// `[oklch(var(--token))]` is intentionally allowed (that IS using a token).
const ARBITRARY =
  /\b(?:text|bg|border|ring|from|to|via|fill|stroke|decoration|outline|divide|placeholder|accent|caret|shadow)-\[(?:#|rgb|hsl)/;

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.(tsx?|jsx?)$/.test(name)) out.push(p);
  }
  return out;
}

const violations = [];
for (const root of ROOTS) {
  for (const file of walk(root)) {
    if (ALLOW.has(file)) continue;
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      if (PALETTE.test(line) || HEX.test(line) || ARBITRARY.test(line)) {
        violations.push(`${file}:${i + 1}  ${line.trim().slice(0, 100)}`);
      }
    });
  }
}

if (violations.length) {
  console.error(
    `\n✗ ${violations.length} raw palette / hex colour(s) found — use design tokens instead:\n`,
  );
  for (const v of violations) console.error("  " + v);
  console.error(
    "\nMap: green→success, red→destructive, amber→warning, blue→info, purple→primary, gray→muted/foreground/border.\n",
  );
  process.exit(1);
}
console.log("✓ No raw palette or hex colours in pages/ or components/.");
