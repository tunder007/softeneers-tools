#!/usr/bin/env node
// Pre-publish helper: install the 13 sibling leaf repos from disk (file: deps) so the wrapper can
// be exercised end-to-end before anything is published to npm. Sibling layout assumed:
//   softeneers-oss/softeneers-tools/   <- here
//   softeneers-oss/<repo>/             <- the leaf repos
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { REGISTRY } from "../lib/registry.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const SIBLINGS = path.resolve(ROOT, "..");

// map @softeneers/<x> -> sibling folder name. The folder is the slug, except distribution.
const FOLDER = { "@softeneers/distribution": "distribution" };

const specs = [];
for (const t of REGISTRY) {
  const folder = FOLDER[t.pkg] || t.slug;
  const dir = path.join(SIBLINGS, folder);
  if (!fs.existsSync(dir)) { console.error(`! missing sibling repo: ${dir}`); continue; }
  specs.push(dir);
}

// --install-links COPIES the file: deps instead of symlinking, which mirrors a real npm publish
// install (so cross-package composition like project-benchmark -> deterministic-checker resolves).
console.log(`Linking ${specs.length} local leaf repos into ${path.basename(ROOT)}/ ...`);
const res = spawnSync("npm", ["install", "--install-links", "--no-save", "--no-package-lock", ...specs], { stdio: "inherit", cwd: ROOT });
process.exit(res.status == null ? 1 : res.status);
