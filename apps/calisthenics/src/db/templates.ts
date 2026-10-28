import type { ISessionTemplate, ITemplateItem } from '../domain/types';
import { getDb, newId, now } from './schema';

export const listTemplates = async () =>
  (await (await getDb()).getAll('templates')).sort((a, b) => a.createdAt.localeCompare(b.createdAt));

export const getTemplate = async (id: string) => (await getDb()).get('templates', id);

export const saveTemplate = async (input: { id?: string; name: string; items: ITemplateItem[] }) => {
  const db = await getDb();
  const existing = input.id ? await db.get('templates', input.id) : undefined;
  const timestamp = now();
  const template: ISessionTemplate = {
    id: existing?.id ?? newId(),
    name: input.name.trim(),
    items: input.items,
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
  await db.put('templates', template);
  return template;
};

export const duplicateTemplate = async (id: string) => {
  const template = await getTemplate(id);
  if (!template) throw new Error('Modèle introuvable.');
  return saveTemplate({ name: `${template.name} (copie)`, items: template.items });
};

/** Deleting a template frees the programme days that used it; logged sessions keep their copy. */
export const deleteTemplate = async (id: string) => {
  const db = await getDb();
  const tx = db.transaction(['templates', 'programme'], 'readwrite');
  const programme = await tx.objectStore('programme').get('current');
  if (programme) {
    const days = programme.days.map((day) => (day?.templateId === id ? null : day));
    await tx.objectStore('programme').put({ ...programme, days });
  }
  await tx.objectStore('templates').delete(id);
  await tx.done;
};

export const addItemToTemplate = async (id: string, item: ITemplateItem) => {
  const template = await getTemplate(id);
  if (!template) throw new Error('Modèle introuvable.');
  return saveTemplate({ ...template, items: [...template.items, item] });
};
