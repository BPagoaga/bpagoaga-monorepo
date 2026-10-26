---
name: mockup
description: >
  Use when the user asks for a UI/UX mockup ("maquette") of a page, screen, or
  component of one of the apps — e.g. "fais-moi une maquette de X", "crée un mockup du
  composant Y", "propose une autre version de Z", or when the user invokes `/mockup`.
  Generates or reuses composable HTML/Nunjucks under `apps/mockups/`, served locally by
  Eleventy and styled with the real design tokens (`@bpagoaga/ui`). Not for
  implementing a feature — only for producing something reviewable in a browser before
  any real implementation code is written.
user-invocable: true
---

# Mockup (in-repo composable mockup system)

Produces or extends composable mockups under `apps/mockups/` — components as Nunjucks
macros in `_includes/macros/`, pages that assemble them, both cataloged automatically
at `/`. Full rationale, structure and conventions live in
[`apps/mockups/README.md`](../../../apps/mockups/README.md) — read it once per session
before touching this system, it is the source of truth.

## Steps

1. **Decide: component or page.**
   - A reusable UI piece (header, card, button, form field...) → a **component**:
     `_includes/macros/<kind>/<slug>.njk` (the macro) +
     `components/<kind>/<slug>/<slug>.html` (its demo page, showing every state) +
     `components/<kind>/<slug>/<slug>.meta.yml`. `_includes/macros/` is where the markup
     is _defined_, `components/` is where it's _shown_.
   - A specific screen/flow → a **page**: `pages/<slug>/<slug>.html`, composing
     components via `{% from "macros/<kind>/<slug>.njk" import … %}`. If the page needs a
     component that doesn't exist yet, build that component first, then compose it —
     never inline its markup in the page.

2. **`reference/` or `proposals/`?** `reference/` = faithful transcription of a component
   that already exists in the real code (`packages/ui`, `apps/*`) — read it before writing
   the macro. `proposals/` = a new component invented for this mockup. While the apps are
   empty shells, everything is a proposal. The folder must agree with `kind:` in the
   `.meta.yml`.

3. **Check whether it already exists.** List `components/reference/`,
   `components/proposals/` and `pages/` first. If it exists (`draft` or `validated`),
   iterate in place; to compare two directions, add a variant (`v2-<name>.html`) in the
   same folder instead of a new folder.

4. **Ground the design in the real thing.** If the screen exists in an app, read its
   source for the real information architecture and copy. Demo content goes in
   `_data/<app>.mjs`, with realistic volumes (long names, many items, empty lists).

5. **Use real tokens, never hardcode.** Tailwind classes from `packages/ui/src/theme.css`
   only (`bg-primary-100`, `text-body-s`, `shadow-elevation-2`, `bg-surface`,
   `text-muted`...). The default Tailwind palette is disabled, so an invented class
   silently renders nothing. Classes built dynamically (loops, JS) must be declared in
   `apps/mockups/src/tailwind.css` (`@source inline(...)` or `@source '<file>'`). If a
   token is missing, say so in the `.meta.yml` `notes:` rather than using a raw value.

6. **Write the macro/page and its `.meta.yml`** (schema in the README: `id`, `title`,
   `kind`, `status`, `app`, `area`, `channels`, `states`, `notes`; never declare
   dependencies, they are derived from imports). Name any extra macro file
   `<component-slug>-<suffix>.njk` so the index attaches it to its component. Document
   every state as its own section of the demo page. Breakpoint-dependent states go in a
   fixed-width `<iframe>` pointing at a `previews/` page. If the macro departs from what
   the real component will do, say so in a comment at the top of the `.njk`.

7. **Review against the UI/UX principles** (_Principes UI/UX_ in the README): the
   2-second impression, one primary action, WCAG 2.2 AA (contrast, focus, target sizes,
   no colour-only meaning), empty / loading / error / long-content states, copy, every
   declared channel. Fix what you can; record deliberate trade-offs in `notes:`. Mention
   in your reply what the review changed or flagged.

8. **Verify in a browser before calling it done.** Run `pnpm build:mockups` (catches
   template errors), then either ask the user to run `pnpm dev:mockups` or, to
   self-verify, start it, check the page at `http://localhost:8080`, and **stop it
   afterwards** (see `AGENTS.md`, _Dev Servers_). Confirm the tokens actually render and
   that no console/network error appears.

9. **Tell the user how to look at it** — the catalogue URL and the component/page URL.

## Do not

- Do not implement the real feature as part of this skill. Mockup only.
- Do not import from `apps/mockups` in `apps/*` or `packages/*`.
- Do not duplicate a component's markup in a page — import its macro.
- Do not guess tokens from memory when `packages/ui/src/theme.css` is one read away.
- Do not leave a `proposals/` component at `status: implemented` — promote it to
  `reference/`.
