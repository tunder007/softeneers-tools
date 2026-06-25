// The Softeneers tool registry: slug -> npm package + the bin to use by default.
// `run <slug>` dispatches to `primaryBin`. A tool with more than one bin lists `bins`;
// select a non-default one with `run <slug> --bin <name>`.
export const REGISTRY = [
  { slug: "deterministic-checker",     pkg: "@softeneers/deterministic-checker",     primaryBin: "deterministic-checker" },
  { slug: "workspace-optimizer",       pkg: "@softeneers/workspace-optimizer",       primaryBin: "workspace-optimizer" },
  { slug: "feature-structure-creator", pkg: "@softeneers/feature-structure-creator", primaryBin: "feature-structure-creator" },
  { slug: "vercel-deploy",             pkg: "@softeneers/vercel-deploy",             primaryBin: "vercel-deploy" },
  { slug: "railway-deploy",            pkg: "@softeneers/railway-deploy",            primaryBin: "railway-deploy" },
  { slug: "github-sync",               pkg: "@softeneers/github-sync",               primaryBin: "github-sync" },
  { slug: "design-language",           pkg: "@softeneers/design-language",           primaryBin: "design" },
  { slug: "oss-track",                 pkg: "@softeneers/oss-track",                 primaryBin: "oss-check" },
  { slug: "distribution",              pkg: "@softeneers/distribution",              primaryBin: "skill-sync" },
  { slug: "project-benchmark",         pkg: "@softeneers/project-benchmark",         primaryBin: "project-benchmark" },
  { slug: "creator",                   pkg: "@softeneers/creator",                   primaryBin: "skill-creator" },
  { slug: "doctor",                    pkg: "@softeneers/doctor",                    primaryBin: "skill-doctor" },
  { slug: "linearizer",                pkg: "@softeneers/linearizer",                primaryBin: "linearizer" },
  { slug: "handoff",                   pkg: "@softeneers/handoff",                   primaryBin: "handoff-new", bins: ["handoff-new", "handoff-context", "handoff-lint", "handoff-install"] },
];

export function findTool(slug) {
  return REGISTRY.find((t) => t.slug === slug);
}
