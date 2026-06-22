#!/usr/bin/env node
// softeneers-tools — one front door to the Softeneers tool suite.
// Zero dependencies. Resolves each @softeneers/* package from node_modules and dispatches to it.
//
// Usage:
//   softeneers-tools list                         list every tool and whether it is installed
//   softeneers-tools run <slug> [--bin <name>] -- <args...>   run a tool, passing args through
//   softeneers-tools doctor [-- <args...>]        run @softeneers/doctor against the cwd
//   softeneers-tools init [target] [--write]      wire installed tools into a repo as Claude/Cursor skills
//   softeneers-tools help | --help | -h
//   softeneers-tools version | --version | -v
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { REGISTRY, findTool } from "../lib/registry.mjs";
import { resolveEntry, isInstalled } from "../lib/resolve.mjs";

const SELF = JSON.parse(fs.readFileSync(path.resolve(fileURLToPath(import.meta.url), "../../package.json"), "utf8"));

function splitPassthrough(argv) {
  const i = argv.indexOf("--");
  return i === -1 ? { head: argv, rest: [] } : { head: argv.slice(0, i), rest: argv.slice(i + 1) };
}

function takeFlag(arr, name) {
  const i = arr.indexOf(name);
  if (i === -1) return null;
  const val = arr[i + 1];
  arr.splice(i, 2);
  return val;
}

function hasFlag(arr, name) {
  const i = arr.indexOf(name);
  if (i === -1) return false;
  arr.splice(i, 1);
  return true;
}

// ---------------- commands ----------------

function cmdList() {
  console.log(`\nsofteneers-tools v${SELF.version} — ${REGISTRY.length} tools\n`);
  let installed = 0;
  for (const t of REGISTRY) {
    const r = resolveEntry(t);
    const mark = r.ok ? "●" : "○";
    if (r.ok) installed++;
    const desc = r.ok && r.description ? r.description : `not installed — npm i ${t.pkg}`;
    console.log(`  ${mark} ${t.slug.padEnd(26)} ${desc}`);
  }
  console.log(`\n  ● installed (${installed}/${REGISTRY.length})   ○ not installed`);
  console.log(`  run a tool:  softeneers-tools run <slug> -- <args>\n`);
}

function cmdRun(head, passthrough) {
  const binOverride = takeFlag(head, "--bin");
  const slug = head[0];
  if (!slug) { console.error("usage: softeneers-tools run <slug> [--bin <name>] -- <args...>"); process.exit(2); }
  const tool = findTool(slug);
  if (!tool) {
    console.error(`Unknown tool: ${slug}`);
    console.error(`Available: ${REGISTRY.map((t) => t.slug).join(", ")}`);
    process.exit(2);
  }
  const r = resolveEntry(tool, binOverride);
  if (!r.ok) {
    if (r.reason === "not-installed") {
      console.error(`${tool.slug} is not installed.\n  npm i ${tool.pkg}\n  (or globally: npm i -g ${tool.pkg})`);
    } else if (r.reason === "no-bin") {
      console.error(`No bin "${binOverride}" in ${tool.pkg}. Available: ${r.available.join(", ")}`);
    } else {
      console.error(`Cannot run ${tool.slug}: ${r.reason} (${r.entry || ""})`);
    }
    process.exit(2);
  }
  // Pass through everything after `--`; if the user omitted `--`, fall back to extra head args.
  const args = passthrough.length ? passthrough : head.slice(1);
  const res = spawnSync(process.execPath, [r.entry, ...args], { stdio: "inherit", cwd: process.cwd() });
  process.exit(res.status == null ? 1 : res.status);
}

function cmdDoctor(passthrough) {
  const tool = findTool("doctor");
  const r = resolveEntry(tool);
  if (!r.ok) {
    console.error(`@softeneers/doctor is not installed.\n  npm i ${tool.pkg}`);
    process.exit(2);
  }
  const res = spawnSync(process.execPath, [r.entry, ...passthrough], { stdio: "inherit", cwd: process.cwd() });
  process.exit(res.status == null ? 1 : res.status);
}

// Generate lightweight skill "pointers" so any AI agent in the target repo can invoke a tool.
function skillMd(tool, description) {
  return [
    "---",
    `name: ${tool.slug}`,
    `description: ${description || tool.pkg}`,
    "---",
    "",
    `# ${tool.slug}`,
    "",
    `Provided by \`${tool.pkg}\` via the \`softeneers-tools\` suite.`,
    "",
    "To use this tool, run:",
    "",
    "```bash",
    `npx softeneers-tools run ${tool.slug} -- <args>`,
    "```",
    "",
    `See \`${tool.pkg}\` on npm for full documentation.`,
    "",
  ].join("\n");
}

function cursorRule(tool, description) {
  return [
    "---",
    `description: ${description || tool.pkg}`,
    "alwaysApply: false",
    "---",
    "",
    `# ${tool.slug}`,
    "",
    `Run via: \`npx softeneers-tools run ${tool.slug} -- <args>\` (from \`${tool.pkg}\`).`,
    "",
  ].join("\n");
}

function cmdInit(head) {
  const write = hasFlag(head, "--write");
  const target = path.resolve(head[0] || process.cwd());
  const tools = REGISTRY.filter((t) => isInstalled(t.pkg));
  console.log(`\ninit → ${target}${write ? "" : "   (dry-run — pass --write to apply)"}`);
  if (!tools.length) {
    console.log("  No @softeneers/* tools installed. Install some (or `npm i softeneers-tools`) first.\n");
    return;
  }
  const planned = [];
  for (const t of tools) {
    const r = resolveEntry(t);
    const desc = r.description || t.pkg;
    planned.push([path.join(target, ".claude", "skills", t.slug, "SKILL.md"), skillMd(t, desc)]);
    planned.push([path.join(target, ".cursor", "rules", `${t.slug}.mdc`), cursorRule(t, desc)]);
  }
  let wrote = 0, same = 0;
  for (const [file, body] of planned) {
    const rel = path.relative(target, file);
    const exists = fs.existsSync(file);
    const unchanged = exists && fs.readFileSync(file, "utf8") === body;
    if (unchanged) { same++; console.log(`  = ${rel}`); continue; }
    if (write) {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, body);
      wrote++;
    }
    console.log(`  ${exists ? "~" : "+"} ${rel}`);
  }
  console.log(write ? `\n  wrote ${wrote}, unchanged ${same}.\n` : `\n  ${planned.length - same} file(s) would be written. Re-run with --write.\n`);
}

function cmdHelp() {
  console.log(`
softeneers-tools v${SELF.version}

  list                              show all tools and install status
  run <slug> [--bin <name>] -- ...  run a tool, passing args through after --
  doctor [-- ...]                   validate the skills in the current repo
  init [target] [--write]           wire installed tools into a repo (.claude / .cursor)
  help | version

Examples
  npx softeneers-tools list
  npx softeneers-tools run deterministic-checker -- .
  npx softeneers-tools run design-language --bin design-lint -- src
  npx softeneers-tools init --write
`);
}

// ---------------- entry ----------------
const { head, rest } = splitPassthrough(process.argv.slice(2));
const cmd = head[0];
const args = head.slice(1);

switch (cmd) {
  case "list": cmdList(); break;
  case "run": cmdRun(args, rest); break;
  case "doctor": cmdDoctor(rest); break;
  case "init": cmdInit(args); break;
  case "version": case "--version": case "-v": console.log(SELF.version); break;
  case undefined: case "help": case "--help": case "-h": cmdHelp(); break;
  default:
    console.error(`Unknown command: ${cmd}\n`);
    cmdHelp();
    process.exit(2);
}
