import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { createTestApp } from './testApp';

type TestApp = Awaited<ReturnType<typeof createTestApp>>;
type Client = Awaited<ReturnType<TestApp['signUp']>>;

let testApp: TestApp;

beforeAll(async () => {
  testApp = await createTestApp();
});

describe('authentication', () => {
  it('rejects the API without a session cookie', async () => {
    const response = await testApp.app.request('/api/templates');
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ message: 'Connecte-toi pour continuer.' });
  });

  it('serves the OpenAPI document and the health check without one', async () => {
    expect((await testApp.app.request('/api/openapi.json')).status).toBe(200);
    expect((await testApp.app.request('/api/health')).status).toBe(200);
  });
});

describe('a new account', () => {
  let client: Client;

  beforeAll(async () => {
    client = await testApp.signUp('new@example.com', 'Léa');
  });

  it('starts with a profile, the default templates and an all-rest programme', async () => {
    expect((await client.get('/profile')).body).toEqual({ firstName: 'Léa' });
    const templates = (await client.get('/templates')).body;
    expect(templates.map((template: { name: string }) => template.name)).toEqual([
      'Tirage + gainage',
      'Poussée + jambes',
      'Figures + tirage lesté',
    ]);
    expect((await client.get('/programme')).body).toEqual({ days: [null, null, null, null, null, null, null] });
  });

  it('only sees its own data', async () => {
    const other = await testApp.signUp('other@example.com', 'Max');
    const [template] = (await client.get('/templates')).body;
    expect((await other.get(`/templates/${template.id}`)).status).toBe(404);
    expect((await other.put('/programme/days/0', { templateId: template.id })).status).toBe(404);
  });
});

describe('templates and programme', () => {
  let client: Client;

  beforeAll(async () => {
    client = await testApp.signUp('templates@example.com');
  });

  it('validates exercises against the content', async () => {
    const response = await client.post('/templates', {
      name: 'Inconnu',
      items: [{ exerciseId: 'nope', target: { sets: 3, reps: 5 } }],
    });
    expect(response).toEqual({ status: 400, body: { message: 'Exercice inconnu.' } });
  });

  it('frees the programme days of a deleted template', async () => {
    const created = await client.post('/templates', {
      name: 'Tirage',
      items: [{ exerciseId: 'traction-stricte', target: { sets: 4, reps: 'max' } }],
    });
    expect(created.status).toBe(201);
    const week = await client.put('/programme/days/1', { templateId: created.body.id });
    expect(week.body.days[1]).toEqual({ templateId: created.body.id });

    expect((await client.delete(`/templates/${created.body.id}`)).status).toBe(204);
    expect((await client.get('/programme')).body.days[1]).toBeNull();
  });
});

describe('sessions', () => {
  let client: Client;

  beforeAll(async () => {
    client = await testApp.signUp('sessions@example.com');
  });

  it('logs sets, allows one running session at a time, and finishes', async () => {
    const started = await client.post('/sessions', {
      title: 'Séance libre',
      exercises: [{ exerciseId: 'traction-stricte' }],
    });
    expect(started.status).toBe(201);
    const id = started.body.id;

    expect((await client.post('/sessions', { title: 'Une autre', exercises: [] })).status).toBe(409);
    expect((await client.get('/sessions/current')).body.id).toBe(id);

    await client.post(`/sessions/${id}/exercises/0/sets`, { reps: 8 });
    const logged = await client.post(`/sessions/${id}/exercises/0/sets`, { reps: 7, rpe: 8 });
    expect(logged.body.exercises[0].sets).toMatchObject([{ reps: 8 }, { reps: 7, rpe: 8 }]);
    expect((await client.delete(`/sessions/${id}/exercises/0/sets/last`)).body.exercises[0].sets).toHaveLength(1);
    expect((await client.post(`/sessions/${id}/exercises/3/sets`, { reps: 1 })).status).toBe(404);

    const finished = await client.post(`/sessions/${id}/finish`, { rpe: 8, feeling: 'great' });
    expect(finished.body).toMatchObject({ rpe: 8, feeling: 'great' });
    expect(finished.body.endedAt).toBeDefined();
    expect((await client.get('/sessions/current')).body).toBeNull();
    expect((await client.post(`/sessions/${id}/finish`, {})).status).toBe(409);
  });
});

describe('level test and progress', () => {
  let client: Client;

  beforeAll(async () => {
    client = await testApp.signUp('level@example.com');
  });

  it('places every progression from the results', async () => {
    const test = await client.post('/level-tests', { results: { pull: 9, push: 32, dips: 14, core: 40 } });
    expect(test.status).toBe(201);
    const progress = (await client.get('/progress')).body as { progressionId: string; currentStep: number }[];
    const stepOf = (id: string) => progress.find((entry) => entry.progressionId === id)?.currentStep;
    expect(stepOf('muscle-up')).toBe(2);
    expect(stepOf('hspu')).toBe(2);
    expect(stepOf('l-sit')).toBe(1);
  });

  it('validates a step and keeps its history', async () => {
    const response = await client.put('/progress/muscle-up', { step: 3, source: 'criterion' });
    expect(response.body.currentStep).toBe(3);
    expect(response.body.history.map((entry: { source: string }) => entry.source)).toEqual(['level-test', 'criterion']);
    expect((await client.put('/progress/muscle-up', { step: 99, source: 'manual' })).status).toBe(400);
  });
});

describe('backup', () => {
  it('round-trips an export into another account, with fresh ids', async () => {
    const source = await testApp.signUp('source@example.com', 'Source');
    const [template] = (await source.get('/templates')).body;
    await source.put('/programme/days/3', { templateId: template.id });
    const session = await source.post('/sessions', { title: template.name, templateId: template.id, exercises: [] });
    await source.post(`/sessions/${session.body.id}/finish`, {});
    const backup = (await source.get('/backup')).body;

    const target = await testApp.signUp('target@example.com', 'Target');
    expect((await target.put('/backup', backup)).status).toBe(204);

    const [importedSession] = (await target.get('/sessions')).body;
    const importedTemplates = (await target.get('/templates')).body;
    expect(importedTemplates).toHaveLength(3);
    expect(importedSession.id).not.toBe(session.body.id);
    expect(importedSession.templateId).toBe(importedTemplates[0].id);
    expect((await target.get('/programme')).body.days[3]).toEqual({ templateId: importedTemplates[0].id });
    expect((await target.get('/profile')).body.firstName).toBe('Source');
  });

  it('imports an export of the former local app', async () => {
    const client = await testApp.signUp('legacy@example.com');
    const legacy = {
      app: 'calibuddy',
      schemaVersion: 1,
      exportedAt: '2026-10-28T10:00:00.000Z',
      data: {
        profile: [{ id: 'me', goalProgressionId: 'muscle-up', onboardedAt: '2026-10-20T10:00:00.000Z' }],
        templates: [],
        programme: [{ id: 'current', days: [null, null, null, null, null, null, null] }],
        sessions: [],
        progress: [],
        levelTests: [],
      },
    };
    expect((await client.put('/backup', legacy)).status).toBe(204);
    expect((await client.get('/profile')).body).toMatchObject({ goalProgressionId: 'muscle-up' });
  });

  it('rejects a file that is not a backup', async () => {
    const client = await testApp.signUp('invalid@example.com');
    const response = await client.put('/backup', { app: 'other' });
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/pas un export CaliBuddy valide/);
  });
});
