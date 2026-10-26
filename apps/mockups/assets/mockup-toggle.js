// Generic local-UI-state toggles for mockups (menus, panels, tabs, chips).
// Never business logic, never a network call — just enough to demo an interaction.
//
// Lookups are scoped to the nearest [data-mockup-scope] ancestor: a demo page usually
// stacks several instances of the same component (one per state), and a document-wide
// lookup would always hit the first instance.
//
//   data-mockup-toggle="<name>"  on a trigger  → shows/hides data-mockup-panel="<name>"
//                                                (aria-expanded kept in sync)
//   data-mockup-tab="<group>:<value>"          → shows data-mockup-tab-panel="<group>:<value>",
//                                                hides the group's other panels, and sets
//                                                aria-selected on the group's tabs
//   data-mockup-chip                           → flips aria-pressed (filter chips)
const scopeOf = (el) => el.closest('[data-mockup-scope]') ?? document;

document.addEventListener('click', (event) => {
  const toggle = event.target.closest('[data-mockup-toggle]');
  if (toggle) {
    const name = toggle.dataset.mockupToggle;
    const panels = scopeOf(toggle).querySelectorAll(`[data-mockup-panel="${name}"]`);
    let open = false;
    panels.forEach((panel) => {
      panel.classList.toggle('hidden');
      open = !panel.classList.contains('hidden');
    });
    toggle.setAttribute('aria-expanded', String(open));
    return;
  }

  const tab = event.target.closest('[data-mockup-tab]');
  if (tab) {
    const [group] = tab.dataset.mockupTab.split(':');
    const scope = scopeOf(tab);
    scope.querySelectorAll(`[data-mockup-tab^="${group}:"]`).forEach((t) => {
      t.setAttribute('aria-selected', String(t === tab));
    });
    scope.querySelectorAll(`[data-mockup-tab-panel^="${group}:"]`).forEach((panel) => {
      panel.classList.toggle('hidden', panel.dataset.mockupTabPanel !== tab.dataset.mockupTab);
    });
    return;
  }

  const chip = event.target.closest('[data-mockup-chip]');
  if (chip) chip.setAttribute('aria-pressed', String(chip.getAttribute('aria-pressed') !== 'true'));
});

// Escape closes any open toggle panel.
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  document.querySelectorAll('[data-mockup-toggle][aria-expanded="true"]').forEach((toggle) => toggle.click());
});
