import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { parse } from 'yaml';

/**
 * Catalogue auto-généré depuis les `.meta.yml` — jamais maintenu à la main, pour ne
 * jamais désynchroniser la liste affichée du contenu réel des dossiers.
 */
// Le `title` du front-matter d'une variante sert de libellé dans le catalogue — pas son
// nom de fichier : une seule source pour « comment cette variante s'appelle ».
async function frontMatter(filePath) {
  const content = await readFile(filePath, 'utf8');
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  return match ? (parse(match[1]) ?? {}) : {};
}

async function collect(relativeDir, url) {
  const root = new URL(`../${relativeDir}/`, import.meta.url).pathname;
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch {
    return [];
  }

  const items = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const dir = join(root, entry.name);
    const metaPath = join(dir, `${entry.name}.meta.yml`);
    const files = (await readdir(dir)).filter((f) => f.endsWith('.html')).sort();

    const variants = await Promise.all(
      files.map(async (file) => {
        const isCanonical = file === `${entry.name}.html`;
        const variantSlug = file.replace(/\.html$/, '');
        const fm = await frontMatter(join(dir, file));
        return {
          file,
          isCanonical,
          url: isCanonical ? `${url}/${entry.name}/` : `${url}/${entry.name}/${variantSlug}/`,
          label: fm.title ?? variantSlug,
        };
      }),
    );
    // La version canonique d'abord, les variantes (v2-, v3-…) ensuite.
    variants.sort((a, b) => Number(b.isCanonical) - Number(a.isCanonical) || a.file.localeCompare(b.file));

    try {
      const meta = parse(await readFile(metaPath, 'utf8'));
      items.push({ ...meta, slug: entry.name, url: `${url}/${entry.name}/`, variants });
    } catch {
      // Un composant/page sans .meta.yml est signalé dans le catalogue plutôt que masqué.
      items.push({ slug: entry.name, url: `${url}/${entry.name}/`, variants, missingMeta: true });
    }
  }

  return items.sort((a, b) => a.slug.localeCompare(b.slug));
}

/**
 * Composants « reference » (components/reference/) : transcription fidèle d'un composant
 * qui existe déjà dans le vrai code (`packages/ui`, `apps/*`). Composants « proposals »
 * (components/proposals/) : idées nouvelles, pas (encore) implémentées. Un `kind`
 * différent du dossier est signalé — dossier et méta doivent rester cohérents.
 */
async function collectComponents(kind) {
  const items = await collect(`components/${kind}`, `/components/${kind}`);
  return items.map((item) => ({
    ...item,
    kind,
    kindMismatch: !item.missingMeta && item.kind !== undefined && item.kind !== kind,
  }));
}

// ---------------------------------------------------------------------------
// Index navigable : tout ce qui suit est dérivé, jamais saisi à la main.
// - uses / usedBy : graphe d'usage calculé depuis les `{% from "macros/…" %}` réels.
// - updated : date du dernier commit touchant le dossier (mtime à défaut).
// - app / area / channels : lus dans le .meta.yml (voir README, « Classement »).
// ---------------------------------------------------------------------------

const ROOT = new URL('../', import.meta.url).pathname;
const IMPORT_RE = /macros\/(reference|proposals)\/([\w-]+)\.njk/g;

function importsIn(content) {
  return [...content.matchAll(IMPORT_RE)].map(([, kind, name]) => `${kind}/${name}`);
}

async function macroGraph() {
  const graph = new Map();
  for (const kind of ['reference', 'proposals']) {
    const dir = join(ROOT, '_includes/macros', kind);
    for (const file of (await readdir(dir).catch(() => [])).filter((f) => f.endsWith('.njk'))) {
      const key = `${kind}/${file.replace(/\.njk$/, '')}`;
      graph.set(
        key,
        importsIn(await readFile(join(dir, file), 'utf8')).filter((k) => k !== key),
      );
    }
  }
  return graph;
}

// Un fichier macro appartient au composant dont le slug est le plus long préfixe de son
// nom (session-card-set -> session-card). Sans correspondance, c'est un utilitaire partagé.
function ownerOf(macroKey, componentKeys) {
  const [kind, name] = macroKey.split('/');
  return componentKeys
    .filter((k) => k.startsWith(`${kind}/`) && (name === k.split('/')[1] || name.startsWith(`${k.split('/')[1]}-`)))
    .sort((a, b) => b.length - a.length)[0];
}

function closure(start, graph) {
  const seen = new Set();
  const stack = [...start];
  while (stack.length) {
    const key = stack.pop();
    if (seen.has(key)) continue;
    seen.add(key);
    stack.push(...(graph.get(key) ?? []));
  }
  return seen;
}

async function lastUpdated(relativeDir) {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cs', '--', relativeDir], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (out) return out;
  } catch {
    // pas de git (archive, CI sans historique) : on retombe sur le mtime
  }
  const files = await readdir(join(ROOT, relativeDir));
  const times = await Promise.all(files.map(async (f) => (await stat(join(ROOT, relativeDir, f))).mtime));
  return new Date(Math.max(...times)).toISOString().slice(0, 10);
}

async function enrich(components, pages) {
  const graph = await macroGraph();
  const items = [
    ...components.reference.map((i) => ({
      ...i,
      type: 'reference',
      key: `reference/${i.slug}`,
      dir: `components/reference/${i.slug}`,
    })),
    ...components.proposals.map((i) => ({
      ...i,
      type: 'proposals',
      key: `proposals/${i.slug}`,
      dir: `components/proposals/${i.slug}`,
    })),
    ...pages.map((i) => ({ ...i, type: 'page', key: `page/${i.slug}`, dir: `pages/${i.slug}` })),
  ];
  const componentKeys = items.filter((i) => i.type !== 'page').map((i) => i.key);

  for (const item of items) {
    // Une page dépend de ce que ses .html importent ; un composant, de ce que ses propres
    // macros importent — pas de sa page vitrine.
    const htmlFiles = item.type === 'page' ? item.variants.map((v) => join(ROOT, item.dir, v.file)) : [];
    const direct = (await Promise.all(htmlFiles.map((f) => readFile(f, 'utf8')))).flatMap(importsIn);
    const owned = item.type === 'page' ? [] : [...graph.keys()].filter((k) => ownerOf(k, componentKeys) === item.key);
    const reached = closure([...direct, ...owned.flatMap((k) => graph.get(k))], graph);
    item.uses = [
      ...new Set([...reached].map((k) => ownerOf(k, componentKeys)).filter((k) => k && k !== item.key)),
    ].sort();
    item.updated = await lastUpdated(item.dir);
    item.channels = item.channels ?? [];
    item.app = item.app ?? 'shared';
    item.area = item.area ?? 'Non classé';
  }
  const byKey = new Map(items.map((i) => [i.key, i]));
  for (const item of items) {
    item.usedBy = items
      .filter((other) => other.uses.includes(item.key))
      .map((o) => o.key)
      .sort();
    item.health = [
      item.missingMeta && 'pas de .meta.yml',
      item.kindMismatch && `kind « ${item.kind} » ≠ dossier`,
      !item.missingMeta && !item.status && 'statut manquant',
      item.type === 'proposals' && item.status === 'implemented' && 'implémenté : à promouvoir en reference/',
      item.type !== 'page' && !item.usedBy.some((k) => k.startsWith('page/')) && 'utilisé par aucune page',
    ].filter(Boolean);
  }
  const refs = (keys) =>
    keys
      .map((k) => byKey.get(k))
      .filter(Boolean)
      .map((i) => ({ key: i.key, title: i.title ?? i.slug, url: i.url, type: i.type }));
  for (const item of items) {
    item.usesRefs = refs(item.uses);
    item.usedByRefs = refs(item.usedBy);
  }
  return items;
}

function facet(items, pick) {
  const counts = new Map();
  for (const item of items)
    for (const value of [pick(item)].flat().filter(Boolean)) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts].map(([value, count]) => ({ value, count })).sort((a, b) => a.value.localeCompare(b.value, 'fr'));
}

export default async function catalogue() {
  const components = {
    reference: await collectComponents('reference'),
    proposals: await collectComponents('proposals'),
  };
  const pages = await collect('pages', '/pages');
  const items = await enrich(components, pages);
  return {
    components,
    pages,
    items,
    facets: {
      app: facet(items, (i) => i.app),
      area: facet(items, (i) => i.area),
      channels: facet(items, (i) => i.channels),
      status: facet(items, (i) => i.status ?? 'sans statut'),
    },
  };
}
