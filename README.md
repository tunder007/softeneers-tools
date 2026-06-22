# softeneers-tools

> One front door to the **Softeneers tools** — list, run and wire in 13 zero-dependency AI/dev CLIs through a single command.

`npm install softeneers-tools` pulls in all 13 tools as dependencies and gives you one binary that
discovers, runs and installs them. Each tool is also published standalone under `@softeneers/*` if
you only want one.

Zero runtime dependencies of its own. Node ≥ 18.

## Install

```bash
# global — gives you the `softeneers-tools` command everywhere
npm i -g softeneers-tools

# or per-project
npm i -D softeneers-tools

# or one-off without installing
npx softeneers-tools list
```

## Usage

```bash
softeneers-tools list                                   # all tools + install status
softeneers-tools run <slug> -- <args>                   # run a tool, args after --
softeneers-tools run deterministic-checker -- .          # e.g. score this repo
softeneers-tools run design-language --bin design-lint -- src
softeneers-tools doctor                                  # validate skills in this repo
softeneers-tools init --write                            # wire tools into .claude / .cursor
softeneers-tools help
```

Everything after `--` is passed straight through to the underlying tool.

## The tools

| slug | package | what it does |
|---|---|---|
| `deterministic-checker` | `@softeneers/deterministic-checker` | Score a repo on AI-optimization & determinism |
| `workspace-optimizer` | `@softeneers/workspace-optimizer` | Generate CLAUDE.md / AGENTS.md / .cursor/rules contracts |
| `feature-structure-creator` | `@softeneers/feature-structure-creator` | Scaffold a feature dossier (md source + html view) |
| `vercel-deploy` | `@softeneers/vercel-deploy` | Guard-railed Vercel deploys (preview by default) |
| `railway-deploy` | `@softeneers/railway-deploy` | Dry-run-by-default Railway deploys + secret scan |
| `github-sync` | `@softeneers/github-sync` | Safe gh branch/PR flow with standard conventions |
| `design-language` | `@softeneers/design-language` | Design tokens → CSS generator + token linter |
| `oss-track` | `@softeneers/oss-track` | Score a repo against an open-source checklist |
| `distribution` | `@softeneers/distribution` | Distribute skills to ~/.claude / ~/.cursor or a template |
| `project-benchmark` | `@softeneers/project-benchmark` | 10-dimension project maturity benchmark |
| `creator` | `@softeneers/creator` | Scaffold a new cross-tool AI skill |
| `doctor` | `@softeneers/doctor` | Validate skills against the toolkit standard |
| `linearizer` | `@softeneers/linearizer` | Flatten a repo's AI-source into one token-budgeted bundle |

Run `softeneers-tools list` to see which are installed (`●`) vs not (`○`).

## How it works

The wrapper keeps a registry of the 13 tools. For each command it resolves the tool's package from
your `node_modules`, finds the right `bin`, and dispatches to it with your arguments — so the wrapper
itself stays tiny and every tool remains independently versioned and usable on its own. If a tool
isn't installed, the wrapper tells you exactly how to add it instead of failing opaquely.

## Use them as agent skills

`softeneers-tools init` writes lightweight skill pointers into a repo so Claude Code and Cursor can
invoke any installed tool:

```bash
softeneers-tools init            # dry-run: shows what it would write
softeneers-tools init --write    # writes .claude/skills/* and .cursor/rules/*
```

## License

MIT © 2026 Softeneers
