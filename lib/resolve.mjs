// Locate installed @softeneers/* packages from node_modules and pick the right bin entry.
// Zero dependencies. Degrades gracefully when a package is not installed.
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);

// Resolve a package's install directory, or null if it isn't installed.
export function pkgDir(pkg) {
  try {
    return path.dirname(require.resolve(pkg + "/package.json"));
  } catch {
    return null;
  }
}

export function readPkgJson(dir) {
  try {
    return JSON.parse(fs.readFileSync(path.join(dir, "package.json"), "utf8"));
  } catch {
    return null;
  }
}

export function isInstalled(pkg) {
  return pkgDir(pkg) !== null;
}

// Resolve the absolute path to a tool's executable entry file.
// Returns { ok, reason?, entry?, dir?, bin?, description? }.
export function resolveEntry(tool, binOverride) {
  const dir = pkgDir(tool.pkg);
  if (!dir) return { ok: false, reason: "not-installed" };
  const meta = readPkgJson(dir);
  const binMap = meta && meta.bin ? meta.bin : {};
  const binName = binOverride || tool.primaryBin || Object.keys(binMap)[0];
  const rel = binMap[binName];
  if (!rel) {
    return { ok: false, reason: "no-bin", available: Object.keys(binMap), dir };
  }
  const entry = path.resolve(dir, rel);
  if (!fs.existsSync(entry)) return { ok: false, reason: "missing-entry", entry, dir };
  return { ok: true, entry, dir, bin: binName, description: meta.description, available: Object.keys(binMap) };
}
