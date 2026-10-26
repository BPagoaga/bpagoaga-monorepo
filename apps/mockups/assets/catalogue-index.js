// Index des mockups (index.html) : recherche, facettes, regroupement et fiches.
// Toutes les données sont déjà dans le HTML (rendu au build depuis _data/catalogue.mjs) :
// ce script ne fait que montrer/cacher/réordonner, et garde l'état dans l'URL (#…) pour
// pouvoir partager un lien vers une recherche ou une fiche ouverte.
(() => {
  const root = document.querySelector('[data-catalogue]');
  if (!root) return;

  const FACETS = ['type', 'app', 'area', 'channel', 'status'];
  const APP_ORDER = ['portfolio', 'calisthenics', 'shared'];
  const APP_LABELS = { portfolio: 'Portfolio', calisthenics: 'Calisthenics', shared: 'Socle partagé' };
  const TYPE_ORDER = ['page', 'proposals', 'reference'];
  const TYPE_LABELS = { page: 'Pages', proposals: 'Composants proposition', reference: 'Composants référence' };
  const RECENT_ORDER = ['Cette semaine', 'Ce mois-ci', 'Plus ancien'];

  const normalize = (s) =>
    (s ?? '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase();
  const rows = [...root.querySelectorAll('[data-row-pool] [data-row]')].map((el) => ({
    el,
    key: el.dataset.key,
    title: el.dataset.title,
    updated: el.dataset.updated,
    text: normalize(`${el.dataset.search} ${el.dataset.title}`),
    values: Object.fromEntries(FACETS.map((f) => [f, (el.dataset[f] ?? '').split('|').filter(Boolean)])),
    health: el.dataset.health === '1',
  }));

  const searchInput = root.querySelector('[data-search]');
  const groupsEl = root.querySelector('[data-groups]');
  const emptyEl = root.querySelector('[data-empty]');
  const countEl = root.querySelector('[data-result-count]');
  const drawer = root.querySelector('[data-drawer]');
  const backdrop = root.querySelector('[data-drawer-backdrop]');

  const state = {
    q: '',
    group: 'app',
    health: false,
    open: null,
    facets: Object.fromEntries(FACETS.map((f) => [f, new Set()])),
  };

  // ------------------------------------------------------------------ URL <-> état
  function readHash() {
    const p = new URLSearchParams(location.hash.slice(1));
    state.q = p.get('q') ?? '';
    state.group = p.get('group') ?? 'app';
    state.health = p.get('health') === '1';
    state.open = p.get('open');
    for (const f of FACETS) state.facets[f] = new Set((p.get(f) ?? '').split(',').filter(Boolean));
  }
  function writeHash() {
    const p = new URLSearchParams();
    if (state.q) p.set('q', state.q);
    if (state.group !== 'app') p.set('group', state.group);
    if (state.health) p.set('health', '1');
    for (const f of FACETS) if (state.facets[f].size) p.set(f, [...state.facets[f]].join(','));
    if (state.open) p.set('open', state.open);
    const hash = p.toString();
    history.replaceState(null, '', hash ? `#${hash}` : location.pathname);
  }

  // ------------------------------------------------------------------ filtrage
  function matches(row, ignoreFacet) {
    if (state.health && !row.health) return false;
    for (const f of FACETS) {
      if (f === ignoreFacet || !state.facets[f].size) continue;
      if (!row.values[f].some((v) => state.facets[f].has(v))) return false;
    }
    const terms = normalize(state.q).split(/\s+/).filter(Boolean);
    return terms.every((t) => row.text.includes(t));
  }

  function groupKey(row) {
    switch (state.group) {
      case 'type':
        return row.values.type[0];
      case 'area':
        return row.values.area[0] ?? 'Non classé';
      case 'recent': {
        const days = (Date.now() - new Date(row.updated).getTime()) / 864e5;
        return days <= 7 ? RECENT_ORDER[0] : days <= 31 ? RECENT_ORDER[1] : RECENT_ORDER[2];
      }
      default:
        return row.values.app[0] ?? 'shared';
    }
  }

  function groupLabel(key) {
    if (state.group === 'type') return TYPE_LABELS[key] ?? key;
    if (state.group === 'app') return APP_LABELS[key] ?? key;
    return key;
  }

  function orderGroups(keys) {
    const order = { app: APP_ORDER, type: TYPE_ORDER, recent: RECENT_ORDER }[state.group];
    return keys.sort((a, b) => {
      if (order) {
        const ia = order.indexOf(a);
        const ib = order.indexOf(b);
        if (ia !== ib) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      }
      return a.localeCompare(b, 'fr');
    });
  }

  function sortRows(list) {
    const typeRank = (r) => TYPE_ORDER.indexOf(r.values.type[0]);
    return list.sort((a, b) =>
      state.group === 'recent'
        ? b.updated.localeCompare(a.updated)
        : typeRank(a) - typeRank(b) || a.title.localeCompare(b.title, 'fr'),
    );
  }

  // ------------------------------------------------------------------ rendu
  function render() {
    const visible = rows.filter((r) => matches(r));
    const groups = new Map();
    for (const row of visible) {
      const key = groupKey(row);
      groups.set(key, [...(groups.get(key) ?? []), row]);
    }

    groupsEl.replaceChildren(
      ...orderGroups([...groups.keys()]).map((key) => {
        const section = document.createElement('section');
        section.className = 'space-y-1';
        const h = document.createElement('h2');
        h.className =
          'sticky top-12 z-10 flex items-center gap-2 bg-background/95 py-1.5 text-body-s font-semibold text-neutral-130 backdrop-blur-sm';
        h.innerHTML =
          '<span></span><span class="rounded-full bg-neutral-20 px-2 text-body-xs font-medium text-muted"></span>';
        h.children[0].textContent = groupLabel(key);
        h.children[1].textContent = groups.get(key).length;
        const ul = document.createElement('ul');
        ul.className = 'space-y-1';
        for (const row of sortRows(groups.get(key))) {
          const li = row.el.cloneNode(true);
          li.classList.toggle('is-open', row.key === state.open);
          ul.append(li);
        }
        section.append(h, ul);
        return section;
      }),
    );

    emptyEl.classList.toggle('hidden', visible.length > 0);
    countEl.textContent = `${visible.length} maquette${visible.length > 1 ? 's' : ''} sur ${rows.length}`;

    // Compteurs de facettes : ce que donnerait chaque case en gardant les autres filtres.
    for (const f of FACETS) {
      const pool = rows.filter((r) => matches(r, f));
      root.querySelectorAll(`[data-facet="${f}"]`).forEach((input) => {
        input.checked = state.facets[f].has(input.value);
        const n = pool.filter((r) => r.values[f].includes(input.value)).length;
        const counter = root.querySelector(`[data-facet-count="${f}:${CSS.escape(input.value)}"]`);
        if (counter) counter.textContent = n;
        input.closest('label').classList.toggle('opacity-40', n === 0 && !input.checked);
      });
      const badge = root.querySelector(`[data-facet-active="${f}"]`);
      if (badge) {
        badge.textContent = state.facets[f].size;
        badge.classList.toggle('hidden', !state.facets[f].size);
        if (state.facets[f].size) badge.closest('details').open = true;
      }
    }
    root
      .querySelectorAll('[data-group-by]')
      .forEach((b) => b.setAttribute('aria-checked', String(b.dataset.groupBy === state.group)));
    const filtered = state.q || state.health || FACETS.some((f) => state.facets[f].size);
    root
      .querySelectorAll('[data-reset]')
      .forEach((b) => b.classList.toggle('hidden', !filtered && b.closest('[data-empty]') === null));
    if (searchInput.value !== state.q) searchInput.value = state.q;
    renderDrawer();
    writeHash();
  }

  function renderDrawer() {
    const detail = state.open && drawer.querySelector(`[data-detail="${CSS.escape(state.open)}"]`);
    drawer.querySelectorAll('[data-detail]').forEach((d) => d.classList.toggle('hidden', d !== detail));
    drawer.classList.toggle('hidden', !detail);
    backdrop.classList.toggle('hidden', !detail);
    if (detail) drawer.scrollTop = 0;
  }

  // ------------------------------------------------------------------ événements
  searchInput.addEventListener('input', () => {
    state.q = searchInput.value;
    render();
  });

  root.addEventListener('change', (e) => {
    const input = e.target.closest('[data-facet]');
    if (!input) return;
    const set = state.facets[input.dataset.facet];
    if (input.checked) set.add(input.value);
    else set.delete(input.value);
    render();
  });

  root.addEventListener('click', (e) => {
    const open = e.target.closest('[data-open]');
    if (open) {
      state.open = state.open === open.dataset.open && !drawer.contains(open) ? null : open.dataset.open;
      return render();
    }
    if (e.target.closest('[data-close]') || e.target === backdrop) {
      state.open = null;
      return render();
    }
    const group = e.target.closest('[data-group-by]');
    if (group) {
      state.group = group.dataset.groupBy;
      return render();
    }
    const preset = e.target.closest('[data-preset]');
    if (preset) {
      const [f, v] = preset.dataset.preset.split('=');
      for (const k of FACETS) state.facets[k].clear();
      state.health = f === 'health';
      if (f !== 'health') state.facets[f].add(v);
      return render();
    }
    if (e.target.closest('[data-reset]')) {
      state.q = '';
      state.health = false;
      for (const k of FACETS) state.facets[k].clear();
      return render();
    }
  });

  document.addEventListener('keydown', (e) => {
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName);
    if ((e.key === '/' && !typing) || (e.key === 'k' && (e.metaKey || e.ctrlKey))) {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    } else if (e.key === 'Escape') {
      if (state.open) state.open = null;
      else if (document.activeElement === searchInput) state.q = '';
      render();
    } else if (e.key === 'Enter' && document.activeElement === searchInput) {
      // Entrée : ouvre directement la maquette s'il n'y a qu'un résultat, sinon sa fiche.
      const visibleRows = groupsEl.querySelectorAll('[data-row]');
      if (!visibleRows.length) return;
      if (visibleRows.length === 1) location.href = visibleRows[0].querySelector('a[href]').href;
      else {
        state.open = visibleRows[0].dataset.key;
        render();
      }
    }
  });

  window.addEventListener('hashchange', () => {
    readHash();
    render();
  });

  readHash();
  render();
})();
