#!/usr/bin/env node
// Self-test for softeneers-tools. Hermetic and offline: validates the registry shape and the
// dispatcher's CLI surface without requiring the @softeneers/* packages to be installed.
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { REGISTRY, findTool } from "../lib/registry.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BIN = path.resolve(HERE, "..", "bin", "softeneers-tools.mjs");

let failures = 0;
const ok = (cond, msg) => { console.log(`${cond ? "  ✓" : "  ✗"} ${msg}`); if (!cond) failures++; };
const run = (...args) => spawnSync(process.execPath, [BIN, ...args], { encoding: "utf8" });

console.log("\nsofteneers-tools — self-test\n");

console.log("Registry");
ok(REGISTRY.length === 14, `14 tools registered (${REGISTRY.length})`);
ok(new Set(REGISTRY.map((t) => t.slug)).size === REGISTRY.length, "all slugs unique");
ok(new Set(REGISTRY.map((t) => t.pkg)).size === REGISTRY.length, "all package names unique");
ok(REGISTRY.every((t) => t.pkg.startsWith("@softeneers/")), "every package is @softeneers-scoped");
ok(REGISTRY.every((t) => t.primaryBin && typeof t.primaryBin === "string"), "every tool has a primaryBin");
ok(findTool("doctor")?.pkg === "@softeneers/doctor", "findTool resolves a known slug");
ok(findTool("nope") === undefined, "findTool returns undefined for unknown slug");

console.log("CLI surface");
const list = run("list");
ok(list.status === 0, "`list` exits 0");
ok(/14 tools/.test(list.stdout), "`list` reports 14 tools");
ok(REGISTRY.every((t) => list.stdout.includes(t.slug)), "`list` shows every slug");

const help = run("help");
ok(help.status === 0 && /softeneers-tools/.test(help.stdout), "`help` exits 0 and prints usage");

const version = run("version");
ok(version.status === 0 && /^\d+\.\d+\.\d+/.test(version.stdout.trim()), `\`version\` prints a semver (${version.stdout.trim()})`);

const unknownCmd = run("frobnicate");
ok(unknownCmd.status === 2, "unknown command exits 2");

const runMissing = run("run");
ok(runMissing.status === 2, "`run` with no slug exits 2");

const runBad = run("run", "no-such-tool", "--", "x");
ok(runBad.status === 2 && /Unknown tool/.test(runBad.stderr), "`run <unknown>` exits 2 with a helpful error");

const initDry = run("init", "/tmp/softeneers-tools-selftest-nonexistent");
ok(initDry.status === 0, "`init` (dry-run) exits 0 even with nothing installed");

console.log(failures ? `\nSELF-TEST FAILED (${failures})\n` : `\nSELF-TEST PASSED\n`);
process.exit(failures ? 1 : 0);
