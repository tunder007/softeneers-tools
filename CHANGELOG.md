# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-22

### Added

- Initial public release.
- One front door to the Softeneers tools — list, run and wire in 13 zero-dependency AI/dev CLIs through a single command.
- Bundles all 13 @softeneers/* tools as dependencies.
- Dispatcher CLI: `list`, `run <slug>`, `doctor`, `init` (.claude / .cursor wiring).
- Hermetic self-test (`npm test`) and CI across Node 18, 20 and 22.

[1.0.0]: https://github.com/tunder007/softeneers-tools/releases/tag/v1.0.0
