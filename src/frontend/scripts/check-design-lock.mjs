#!/usr/bin/env node
/**
 * EdUnite shared design-system DRIFT GUARD (vendored into each app's scripts/).
 *
 * Reads src/design-system.lock.json and re-hashes every locked file. If any file
 * was edited, deleted, or replaced in-app, the hash no longer matches and the
 * build FAILS. Self-contained: needs only files inside the app (no shared/ folder
 * at build time), so it runs anywhere the app builds.
 *
 * The only legitimate way to change a locked file is to edit it in the shared/
 * package and re-run `sync-design.mjs`, which regenerates this lock.
 *
 * Run from the app frontend root (wired into `prebuild`):
 *   node scripts/check-design-lock.mjs
 */
import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";

const LOCK = resolve(process.cwd(), "src/design-system.lock.json");
if (!existsSync(LOCK)) {
  console.error(
    "✗ src/design-system.lock.json missing — run the shared sync:\n" +
      "  node <repo>/shared/tools/sync-design.mjs <this-app-frontend>",
  );
  process.exit(1);
}

const lock = JSON.parse(readFileSync(LOCK, "utf8"));
const drifted = [];
const missing = [];

for (const [rel, expected] of Object.entries(lock.files)) {
  const abs = resolve(process.cwd(), rel);
  if (!existsSync(abs)) {
    missing.push(rel);
    continue;
  }
  const actual = createHash("sha256").update(readFileSync(abs)).digest("hex");
  if (actual !== expected) drifted.push(rel);
}

if (drifted.length || missing.length) {
  console.error(
    `\n✗ design system drift — ${drifted.length} edited, ${missing.length} missing ` +
      `(locked v${lock.version}):\n`,
  );
  for (const f of drifted) console.error(`  edited:  ${f}`);
  for (const f of missing) console.error(`  missing: ${f}`);
  console.error(
    "\nThese are LOCKED shared design-system files. Do not edit them in-app.\n" +
      "Edit shared/design-system/, then re-run: node <repo>/shared/tools/sync-design.mjs <this-app-frontend>\n",
  );
  process.exit(1);
}

console.log(
  `✓ design system in sync (v${lock.version}, ${Object.keys(lock.files).length} locked files).`,
);
