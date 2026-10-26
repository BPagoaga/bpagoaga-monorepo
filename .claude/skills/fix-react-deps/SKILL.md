---
name: fix-react-deps
description: >
  Use when fixing React `useEffect`/`useCallback`/`useMemo` dependency arrays in this
  monorepo, cleaning up effects flagged by `react/exhaustive-deps` (Oxlint), removing
  effects that shouldn't exist ("You Might Not Need an Effect"), or when the user invokes
  `/fix-react-deps`. Encodes the audit command, the triage decision tree, and the safety
  checklist needed to avoid introducing "Maximum update depth exceeded" loops. Pass a
  scope as $ARGUMENTS (a workspace dir like `apps/calisthenics/src`, a feature folder, or
  a single file); with no argument, run the audit and report a summary instead of
  editing anything.
user-invocable: true
---

# Fix React dependency arrays

The generic hook-correctness knowledge below (infinite-loop shapes, stale closures, the
fix-vs-suppress rule, the "You Might Not Need an Effect" table) is adapted from the
MIT-licensed `react-errors-hooks` skill in
[OpenAEC-Foundation/React-Claude-Skill-Package](https://github.com/OpenAEC-Foundation/React-Claude-Skill-Package)
(© OpenAEC Foundation).

## Repo facts

- Linting is **Oxlint through Vite+** (`vp lint`), configured in each React workspace's
  `vite.config.ts` (`lint` key). `react/exhaustive-deps` is enabled as `warn`,
  `react/rules-of-hooks` as `error`.
- There is no automated "you might not need an effect" rule: step 2a below is a manual
  read of every effect in scope.
- Test coverage is thin: **"no test went red" is not proof of safety.** Runtime
  verification (Step 4) is mandatory for every file touched.
- If a `useLatest` helper is needed and doesn't exist yet, add it once to a shared hooks
  folder of the workspace rather than inlining the ref-mirror pattern in several files.

## Workflow

### Step 0 — Resolve scope

If `$ARGUMENTS` names a path, use it. If empty, run the audit (Step 1) across every React
workspace, print a per-workspace summary table, and stop — ask which folder to work on.

### Step 1 — Audit the scope

From the workspace directory (its `vite.config.ts` carries the config):

```
cd apps/<workspace> && pnpm exec vp lint <scope-relative-to-workspace> --format json
```

Keep messages whose rule is `react/exhaustive-deps` or `react/rules-of-hooks`, grouped by
file. Then list every `useEffect` / `useLayoutEffect` in scope for Step 2a.

### Step 2 — Triage each file, in this order

**a) Effects that shouldn't exist, first.** If the effect itself is the bug, fixing its
deps is exactly how "Maximum update depth exceeded" gets introduced:

| Shape                                                                    | Diagnosis                 | Fix                                                                                          |
| ------------------------------------------------------------------------ | ------------------------- | -------------------------------------------------------------------------------------------- |
| Effect sets state computed from other state/props, or chains `setState`s | Derived state             | Compute during render (`useMemo` if expensive); collapse chained updates. Delete the effect. |
| Effect reacts to a state change caused by a user action                  | Event handler in disguise | Move the logic into the handler that causes the change.                                      |
| Effect resets state when a prop changes                                  | Reset on prop change      | Use a `key` on the component instead.                                                        |
| Effect pushes data to a parent via a callback prop                       | Data flowing up           | Lift the state, or call the callback from the event handler.                                 |
| Effect with no real work                                                 | Empty effect              | Delete it.                                                                                   |

**b) `exhaustive-deps` findings on effects that survive (a)** — legitimate external
syncs (subscriptions, DOM, timers, third-party widgets). For each reported dep:

| Dependency shape                                                                             | Action                                                                                                                                                                                                                                |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stable reference (setState/dispatch, a `ref`, a module-level constant, an imported function) | Add it. Zero behaviour risk.                                                                                                                                                                                                          |
| Value whose identity changes every render, but whose _value_ change should re-run the effect | Memoize it at the source (`useMemo`/`useCallback` in the producer) rather than widening the deps with an unstable reference — otherwise the effect still fires every render.                                                          |
| Value that must be read fresh inside the effect but must **not** re-run it                   | `useLatest` (ref updated every render) instead of adding it to the deps.                                                                                                                                                              |
| Dependency the effect itself updates                                                         | Check for a cycle; add a guard, or use the functional `setState(prev => …)` form so the effect no longer depends on it.                                                                                                               |
| `useState` value whose setter is called elsewhere with a fresh object/array each time        | `grep -n "set<Name>("` for every call site. If one builds a new object for an unchanged value, the effect silently re-fires (no loop, no error). Fix the setter (`setX(prev => same(prev, next) ? prev : next)`), not the deps array. |

### Step 3 — Apply fixes in small batches

- One file, or a tightly related small group, per commit — keep diffs bisectable.
- After each file, re-run the Step 1 command on it: the addressed warnings are gone and no
  new ones appear. Run `pnpm check-types` for the workspace.

### Step 4 — Verify (mandatory)

- Ask the user to start the app (`pnpm dev:<app>`) — don't start it yourself (see
  `AGENTS.md`, _Dev Servers_) — or use a running instance they point you to.
- Exercise the touched screen: mount/unmount, the prop/state changes the effect depends
  on, at least one edge case.
- Watch the console for `Maximum update depth exceeded` and the network tab for request
  loops **and** for a single redundant refetch on interactions that shouldn't cause one.
- Run any adjacent test (`pnpm exec vp test <file>`), but don't stop there.

### Step 5 — Report

Table per batch: file, rule(s) resolved, category (`effect deleted` / `safe dep added` /
`useLatest applied` / `memoized at source` / `needs human judgment`). Anything you're not
confident about is `needs human judgment`, not a guess.

---

## Reference: generic hook-correctness patterns

### Infinite re-render loop shapes

```typescript
// setState during render itself
const Counter = () => {
  const [count, setCount] = useState(0);
  setCount(count + 1); // WRONG — do this in an event handler instead
  return <p>{count}</p>;
};

// missing dependency array — effect runs every render
useEffect(() => {
  fetchData().then(setData); // WRONG — add `, []` or the real deps
});

// new object/array literal in deps every render
const options = { serverUrl, roomId };
useEffect(() => {
  const conn = createConnection(options);
  return () => conn.disconnect();
}, [options]); // WRONG — options is a new reference every render
// FIX: build the object inside the effect, depend on the primitives (roomId, serverUrl)
```

### Stale closures

```typescript
useEffect(() => {
  const id = setInterval(() => setCount(count + 1), 1000); // WRONG — always resets to 1
  return () => clearInterval(id);
}, []);
// FIX: functional updater
useEffect(() => {
  const id = setInterval(() => setCount((prev) => prev + 1), 1000);
  return () => clearInterval(id);
}, []);
```

### The `useLatest` pattern

```typescript
export const useLatest = <T>(value: T) => {
  const ref = useRef(value);
  ref.current = value;
  return ref;
};

// read fresh `filter` inside an effect keyed only on `range`
const filterRef = useLatest(filter);
useEffect(() => {
  setFilter({ ...filterRef.current, from: toISO(range.from), to: toISO(range.to) });
}, [range, setFilter]);
```

### exhaustive-deps: fix vs. suppress

**Always fix by default.** Suppressing (`// oxlint-disable-next-line react/exhaustive-deps`)
is only acceptable when the missing value is a stable reference known to be safe to omit,
or the effect is genuinely mount-only and reads no reactive values. Never suppress a real
missing dependency — that's a stale-data bug, not a lint false positive.
