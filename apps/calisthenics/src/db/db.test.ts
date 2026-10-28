import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { exportData, importData, parseBackup } from './backup';
import { saveLevelTest } from './levelTests';
import { getProgramme, setProgrammeDay } from './programme';
import { listProgress } from './progress';
import { closeDb, DB_NAME } from './schema';
import { finishSession, getCurrentSession, logSet, startSession } from './sessions';
import { deleteTemplate, listTemplates } from './templates';

afterEach(async () => {
  await closeDb();
  await new Promise<void>((resolve) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
  });
});

describe('database', () => {
  it('starts with the default templates and a rest-only week', async () => {
    expect((await listTemplates()).map((template) => template.name)).toEqual([
      'Tirage + gainage',
      'Poussée + jambes',
      'Figures + tirage lesté',
    ]);
    expect((await getProgramme()).days.every((day) => day === null)).toBe(true);
  });

  it('frees programme days when their template is deleted', async () => {
    const [template] = await listTemplates();
    await setProgrammeDay(1, template.id);
    await deleteTemplate(template.id);
    expect((await getProgramme()).days[1]).toBeNull();
  });

  it('runs a session from start to finish, one at a time', async () => {
    const session = await startSession({ title: 'Tirage', exercises: [{ exerciseId: 'traction-stricte', sets: [] }] });
    await expect(startSession({ title: 'Autre', exercises: [] })).rejects.toThrow('déjà en cours');
    await logSet(session.id, 0, { reps: 12 });
    expect((await getCurrentSession())?.exercises[0].sets).toHaveLength(1);
    await finishSession(session.id, { rpe: 8, feeling: 'great' });
    expect(await getCurrentSession()).toBeNull();
  });

  it('places progressions after a level test', async () => {
    await saveLevelTest({ pull: 9, push: 32, dips: 14, core: 40 });
    const progress = await listProgress();
    expect(progress.find((entry) => entry.progressionId === 'muscle-up')?.currentStep).toBe(2);
  });

  it('round-trips an export through import, and rejects other files', async () => {
    await saveLevelTest({ pull: 9, push: 32, dips: 14, core: 40 });
    const backup = parseBackup(JSON.stringify(await exportData()));
    await importData({ ...backup, data: { ...backup.data, templates: [] } });
    expect(await listTemplates()).toEqual([]);
    expect(await listProgress()).toHaveLength(7);
    expect(() => parseBackup('{"app":"autre"}')).toThrow('pas un export CaliBuddy valide');
    expect(() => parseBackup('pas du json')).toThrow('JSON illisible');
  });
});
