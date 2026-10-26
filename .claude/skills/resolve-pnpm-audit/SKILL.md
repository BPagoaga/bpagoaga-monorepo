---
name: resolve-pnpm-audit
description: Use when `pnpm audit` reports vulnerabilities, when a CI audit step fails, or when the user invokes /resolve-pnpm-audit. Traces each vulnerable transitive package back to the direct dependency, in the responsible workspace's package.json, of this pnpm-workspaces monorepo, and proposes the least invasive fix.
user-invocable: true
---

# Resolve pnpm audit (monorepo)

Audit failures are rarely about scary CVEs — they're about understanding which direct
dependency, in which workspace, drags in an outdated transitive package. Surface that;
don't fix silently.

## Repo facts

- **pnpm workspaces** (`apps/*`, `packages/*`), a single `pnpm-lock.yaml` at the root.
  `pnpm audit`, `pnpm why` and `pnpm install` run from the root and cover every
  workspace. Never `cd` into a workspace to install.
- Shared versions live in the `catalog:` of `pnpm-workspace.yaml` (Vite+, TypeScript,
  Tailwind…). Bumping one of those is a catalog change, not a per-workspace edit.
- `vite` is aliased to `@voidzero-dev/vite-plus-core` through the catalog and an
  `overrides` entry — a Vite advisory is resolved by bumping `vite-plus` in the catalog,
  never by adding a separate `vite` version.

## Steps

1. **Collect.** `pnpm audit --json` (add `--audit-level=high` to match a CI gate). For
   each advisory keep: package, vulnerable range, patched version, severity, paths.
2. **Trace.** For each vulnerable package: `pnpm why <pkg> -r` → the direct dependency
   and the workspace(s) that declare it. Note whether it's a `dependency` (ships to
   users) or a `devDependency` (build-time only) — severity in practice differs.
3. **Find the least invasive fix**, in this order:
   1. Patch/minor bump of the direct dependency that already pulls a fixed version
      (`pnpm view <direct> versions`, check its changelog).
   2. `pnpm update <pkg> -r` when the lockfile is merely stale and the range allows the fix.
   3. Major bump of the direct dependency — list breaking changes first.
   4. Last resort: an `overrides` entry in `pnpm-workspace.yaml` forcing the patched
      transitive version, with a comment saying why and when to remove it.
   5. Accept the risk (dev-only, not reachable) — say so explicitly; nothing is ignored
      silently.
4. **Report** before changing anything: a table per advisory — package, severity,
   workspace, direct dependency, dev/prod, proposed fix, risk. Ask the user which options
   to apply.
5. **Apply** the chosen fixes, run `pnpm install`, re-run `pnpm audit`, then
   `pnpm build` and `pnpm check-types` to confirm nothing broke.

## Do not

- Do not run `pnpm audit --fix` blindly: it writes overrides for everything at once.
- Do not delete `pnpm-lock.yaml` to "start fresh".
- Do not bump a major version without listing its breaking changes first.
