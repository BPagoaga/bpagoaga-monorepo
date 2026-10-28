# AGENTS.md - Coding Agent Guidelines

## Repository Overview

Personal monorepo (Turborepo + pnpm workspaces), toolchain [Vite+](https://viteplus.dev) (`vp`).

| Workspace                  | Stack                                  | Purpose                                                                                                                                                     |
| -------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/portfolio`           | Astro 7, Tailwind CSS 4                | Online résumé / portfolio (static site)                                                                                                                     |
| `apps/calisthenics`        | React 19, Vite+, Tailwind CSS 4        | CaliBuddy, the calisthenics web app (local data in IndexedDB) — see [`apps/calisthenics/README.md`](apps/calisthenics/README.md)                            |
| `apps/calisthenics-mobile` | Expo SDK 58, React Native, Expo Router | Mobile (iOS / Android) version of the calisthenics app, published with EAS — see [`apps/calisthenics-mobile/README.md`](apps/calisthenics-mobile/README.md) |
| `apps/mockups`             | Eleventy 3, Nunjucks, Tailwind CSS 4   | In-repo mockups for the other apps, built on the real design tokens — see [`apps/mockups/README.md`](apps/mockups/README.md)                                |
| `packages/ui`              | Tailwind CSS 4, Storybook 10           | Design system: tokens (`src/theme.css`) and base styles (`src/styles.css`), documented in Storybook                                                         |
| `packages/ui-native`       | React Native                           | React Native components on the `@bpagoaga/ui` tokens (`src/tokens.ts` generated from `theme.css`)                                                           |
| `packages/dev-certs`       | Node                                   | Shared localhost HTTPS certificate for every dev server (`devHttps()` Vite plugin, `dev-certs` CLI)                                                         |

`calisthenics-mobile` is still a shell. New screens are designed in
`apps/mockups` first (see the `mockup` skill), then implemented in the apps.

## Task Management

### TASKS.md Usage

When working on any feature or bug fix:

1. **Always read TASKS.md first** to check current status
2. **Add new tasks** when starting work - break down complex work into clear steps
3. **Update status in real-time** as you progress: `[ ]` Pending → `[~]` In Progress → `[x]` Completed
4. **Move completed tasks** to the "Completed Tasks" section with a date
5. **Add context notes** for important decisions, blockers, or next steps
6. **Keep tasks specific and actionable** - prefer multiple small tasks over one large task

## Commit Convention

[Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject
```

- **`type`** — one of: `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, `test`
- **`scope`** — optional, the workspace or area (`portfolio`, `calisthenics`, `mockups`, `ui`, `root`)
- **`subject`** — short, lowercase, imperative

```
feat(mockups): add session logger component
fix(ui): raise contrast of neutral-90
```

## Build/Test/Lint Commands

All commands run from the repo root with **pnpm** (never npm/yarn — there is one `pnpm-lock.yaml`).

- **Install:** `pnpm install`
- **Build:** `pnpm build` (all, via Turborepo), `pnpm turbo run build --filter=@bpagoaga/calisthenics` (one workspace)
- **Lint:** `pnpm lint` (`vp lint` / Oxlint in every app; React rules in `apps/calisthenics/vite.config.ts`)
- **Tests:** `pnpm test` (Vitest through `vp test`; only `apps/calisthenics` has tests so far)
- **Types:** `pnpm check-types` (`tsc -b` for React, `astro check` for Astro, `tsc --noEmit` for Expo)
- **Mobile:** `pnpm dev:mobile` (Metro / Expo), `pnpm --filter @bpagoaga/calisthenics-mobile doctor` (expo-doctor)
- **Storybook:** `pnpm storybook` (dev, port 6006), `pnpm build:storybook` (static build in `packages/ui/storybook-static`)
- **Format:** `pnpm fmt` (`vp fmt` / Oxfmt, config in root `vite.config.ts`), `pnpm fmt:check` to verify
- **Add a dependency:** `pnpm --filter <workspace> add <pkg>`. Shared versions (Vite+, TypeScript, Tailwind) live in the
  `catalog:` of `pnpm-workspace.yaml` — reference them as `"catalog:"`, don't pin them per workspace.

## CI

Every pull request runs one check workflow per app (`.github/workflows/checks-<app>.yml`), only when that app, the
design system (`packages/ui`) or the shared tooling changed. They all call `.github/workflows/app-checks.yml`:
`pnpm install --frozen-lockfile`, `pnpm audit --audit-level high`, then `turbo run lint`, `turbo run test` and
`turbo run build` filtered on the app (test and build run even when lint fails, so one push reports everything).

Reproduce a check locally before pushing:

```bash
pnpm audit --audit-level high
pnpm turbo run lint build --filter=@bpagoaga/<app>
```

- A dependency change must keep `pnpm audit --audit-level high` clean — see the `resolve-pnpm-audit` skill.
- A new app gets its own `checks-<app>.yml`, copied from an existing one (paths, concurrency group, `app` input).
- `turbo run lint` also lints the app's workspace dependencies (`^lint`): the mobile check runs `ui-native`'s lint,
  which fails when `src/tokens.ts` is out of date. Its `build` is `expo export` (iOS + Android bundles), not a store build.

### Deployment

- `apps/portfolio` is deployed to **GitHub Pages** (custom domain `bernardpagoaga.net`) by
  `.github/workflows/deploy-portfolio.yml`, on every push to `main` that touches the portfolio, `packages/ui` or the
  shared tooling (or by hand: _Actions → Deploy — Portfolio → Run workflow_).
- The site is built for the domain root (`site` in `astro.config.mjs`, no `base`): it only renders correctly on
  `bernardpagoaga.net`, not on the `*.github.io/bpagoaga-monorepo/` URL.
- The custom domain is set in the repository's Pages settings, not with a `CNAME` file (ignored by Actions deployments).

## Dev Servers

**Do not start dev servers (`pnpm dev`, `vp dev`, `astro dev`, tunnels, etc.) on the user's behalf.**

- A background dev server is easy to lose track of and can grow to several GB of RAM if left running unnoticed.
- Ask the user to start it in their own terminal (`pnpm dev:portfolio`, `pnpm dev:calisthenics`, `pnpm storybook`),
  where they can see and stop it, and to share the result.
- Exception: `apps/mockups` is a static Eleventy server with no persistent state — starting it briefly to verify a
  mockup change is fine, but **always stop it afterwards**.
- `astro dev` (Astro 7) detaches when not run in a terminal: stop it with `pnpm --filter @bpagoaga/portfolio astro dev stop`.

### HTTPS

Every dev server runs over HTTPS with one shared certificate, `.certs/localhost.pem` (git-ignored), created on first
start by `@bpagoaga/dev-certs` — signed by mkcert's local CA when mkcert is installed, self-signed otherwise.

- A new Vite-based app adds `devHttps()` from `@bpagoaga/dev-certs` to its plugins (Astro: `vite.plugins`); another
  server takes the paths from `ensureDevCerts()` or the `dev-certs` CLI. Never commit a certificate.
- `pnpm certs --force` regenerates it (e.g. after installing mkcert).
- Exception: Expo's Metro server stays on HTTP — phones and simulators load the bundle over the LAN.
- Locally, call the servers with `curl -k` (or `--cacert "$(mkcert -CAROOT)/rootCA.pem"`).

## Design System Rules

- Styling uses **Tailwind utility classes built from `@bpagoaga/ui` tokens only** (`bg-primary-100`, `text-body-s`,
  `shadow-elevation-2`, semantic `bg-surface` / `text-muted`…). Tailwind's default palette is disabled on purpose.
- Never hardcode a colour, font size or shadow. If a token is missing, add it to `packages/ui/src/theme.css`
  (and check it in Storybook's _Fondations_ stories, read from `theme.css`, or on the mockups' _Design tokens_ page)
  instead of using an arbitrary value.
- Every `packages/ui` component gets a story next to it (`*.stories.tsx`, CSF, French titles).
- **React Native** has no Tailwind: style with `StyleSheet` and the tokens exported by `@bpagoaga/ui-native`
  (`colors['primary-100']`, `typography['body-s']`, `radii.lg`, `shadows['elevation-2']`, `space(4)` for the 4 dp grid),
  and prefer its components (`Text`, `Button`, `Card`, `Badge`). Token names match the web class names.
- `packages/ui-native/src/tokens.ts` is generated from `theme.css` (OKLCH → hex, rem → dp): after changing a token, run
  `pnpm --filter @bpagoaga/ui-native tokens` and commit both files.
- Colour scales go from 10 (lightest) to 150 (darkest), 100 being the reference shade. `accent-100` is too light for
  white text: use dark text (`text-neutral-150`) on it.
- A screen implemented from a mockup reuses the mockup macro's classes as-is.

## Testing Guidelines

- **Vitest** for unit/component tests (bundled with Vite+: `vp test`), Testing Library for React components.
- **NO `require()` in tests:** always use module-level `vi.mock()` and `vi.mocked()` at the top of the file.
- **Mock structure:** create mocked variables right after mock declarations with `vi.mocked(fn)`, and reuse them in
  every test (`mockFn.mockReturnValue(...)`) instead of re-importing.

  ```typescript
  vi.mock('../hooks/useSessions', () => ({
    useSessions: vi.fn(),
  }));
  const mockUseSessions = vi.mocked(useSessions);
  ```

- Test behaviour through the UI (roles, labels, visible text), not implementation details.

## Code Style Guidelines

- **Strict equality:** always `===` / `!==`, never `==` / `!=` (enforced by `eqeqeq`).
- **Formatting:** Oxfmt — 2 spaces, semicolons, single quotes, 120 char width, trailing commas.
- **Components:** PascalCase, functional components as **arrow functions**, self-closing tags when empty. Pages are
  named after the screen (`Dashboard`, `SessionLog`), no prefix.
- **Files:** component folders in PascalCase (`SessionCard/index.tsx`), utilities and hooks in camelCase.
- **Types:** interfaces prefixed with `I` (`ISessionCard`), enums with a descriptive suffix (`ExerciseFamilyEnum`).
  Every interface lives in a `types.ts` next to the file that uses it — never declared inline in a component or hook
  file — re-exported with `export * from './types'`.
- **Imports:** in Vite config files, import from `vite-plus` (not `vite`) — enforced by `vite-plus/prefer-vite-plus-imports`.
  Internal packages use their `@bpagoaga/*` names, never relative paths across workspaces.
- **State:** server state with React Query, global client state with Zustand, complex local logic in custom hooks.
- **Error handling:** handle mutations with `onSuccess` / `onError` / `onSettled`, surface errors to the user
  (toast or inline message), invalidate the affected queries.
- **TypeScript:** strict mode everywhere; no `any`, no non-null assertion unless the invariant is obvious.
- **Language:** all code, comments and inline documentation in English. User-facing copy is in French.

## React Conventions

- **Avoid `useEffect` for derived values** — anything computed from props, state or query results (loading flags,
  validity checks, filtered lists) is a plain `const` computed during render (`useMemo` only if expensive). Reserve
  `useEffect` for synchronising with an external system (DOM APIs, subscriptions, timers, third-party widgets).
- **Event-driven logic belongs in event handlers**, not in an effect watching a state change.
- **Reset state on a prop change with a `key`**, not with an effect.
- **Dependency arrays** must be complete (`react/exhaustive-deps`); see the `fix-react-deps` skill before silencing one.

### React Query

- One `queries/` folder per app, split by domain: `useFetchXxx` hooks, a `XxxQueryKeys` enum per domain (values
  prefixed with the domain name), and stale times as a `XxxStaleTimeEnum` mirroring the key names.
- **`queryKey`** is always `[XxxQueryKeys.SomeKey, ...params]`; when the query takes an options object, pass the whole
  object as a single key element.
- **`enabled`** boolean-coerces the required params (`enabled: !!sessionId`).
- **Debounce search inputs at the call site**: keep the raw value in local state, debounce it (300 ms), and pass the
  debounced value into the query options.

## Expo / React Native

- Expo changes a lot between SDKs: before touching an Expo, EAS or React Native API, read the docs of the installed SDK
  (`https://docs.expo.dev/versions/v<major>.0.0/`, index at https://docs.expo.dev/llms.txt) instead of relying on memory.
- Add native dependencies with `pnpm expo install <pkg>` from `apps/calisthenics-mobile` (SDK-compatible versions),
  then `pnpm --filter @bpagoaga/calisthenics-mobile doctor`. `react`, `react-native` and `expo-font` must keep the exact
  same versions in `packages/ui-native` (devDependencies), or Metro bundles two copies of React.
- Routes live in `src/app/` (Expo Router); everything else outside it.
- `ios/` and `android/` are generated (Continuous Native Generation) and git-ignored: configure native behaviour in
  `app.json` and config plugins, never by hand.
- EAS commands run from `apps/calisthenics-mobile` (`eas.json` lives there). A new native module needs a new
  development build (`development` / `development-simulator` profiles) — Expo Go only ships its bundled modules.

## Accessibility & Responsive

- Target **WCAG 2.2 AA**: text contrast ≥ 4.5:1, visible focus on every interactive element, logical tab order, no
  information carried by colour alone, touch targets ≥ 44×44 px on mobile.
- React Native: `accessibilityRole` / `accessibilityLabel` on every custom pressable (`Button` already sets them).
- Mobile first: the calisthenics app is mostly used on a phone during a workout (one hand, between two sets).
- Every page and every component is responsive, from 320 px up: no horizontal scroll, navigation included (a
  navbar that no longer fits switches to a toggled menu). Check each change at 320 px, 768 px and desktop width.
- External links (leaving the site) open in a new tab with `target="_blank" rel="noopener noreferrer"` and say so to
  screen readers (`(opens in a new tab)`). In `apps/portfolio`, use the `ExternalLink` component.
