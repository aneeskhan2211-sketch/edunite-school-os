#!/usr/bin/env node
/**
 * shadcn/ui guard. Fails if a page hand-rolls a native HTML control that has a
 * shadcn/ui equivalent — `<table>`, `<select>`, `<input>`, `<textarea>`.
 * Pages must compose from components/ui/* (Table, Select, Input, Textarea, …).
 * (Native `<button>` is allowed: a few clickable card/list rows legitimately
 * wrap large layout that shadcn Button shouldn't own.)
 *
 * Run: `pnpm verify:ui` (or `node scripts/check-ui.mjs`).
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = "src/pages";

// element → shadcn replacement (for the error hint)
// Match the native tag whether it's closed on the same line (`<select ...>`,
// `<input/>`) OR opened in the codebase's multiline JSX style (`<select` alone
// at end of line). The `$` arm closes the blind spot for end-of-line tags.
const BANNED = [
  { re: /<table(?:[\s/>]|$)/, name: "<table>", use: "shadcn Table (@/components/ui/table)" },
  { re: /<select(?:[\s/>]|$)/, name: "<select>", use: "shadcn Select (@/components/ui/select)" },
  { re: /<input(?:[\s/>]|$)/, name: "<input>", use: "shadcn Input / Checkbox" },
  { re: /<textarea(?:[\s/>]|$)/, name: "<textarea>", use: "shadcn Textarea" },
];

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
for (const file of walk(ROOT)) {
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    // Escape hatch for justified exceptions (e.g. a bespoke matrix grid that a
    // shadcn Table can't express): put `check-ui-ignore` on the line or the
    // line directly above. Use sparingly — it must name a real reason.
    const ignored =
      line.includes("check-ui-ignore") ||
      (i > 0 && lines[i - 1].includes("check-ui-ignore"));
    if (ignored) return;
    for (const b of BANNED) {
      if (b.re.test(line)) {
        violations.push(`${file}:${i + 1}  ${b.name} → use ${b.use}`);
      }
    }
  });
}

if (violations.length) {
  console.error(
    `\n✗ ${violations.length} native HTML control(s) in pages/ — build from shadcn/ui instead:\n`,
  );
  for (const v of violations) console.error("  " + v);
  console.error("");
  process.exit(1);
}
console.log("✓ No native table/select/input/textarea in pages/ — built from shadcn/ui.");
