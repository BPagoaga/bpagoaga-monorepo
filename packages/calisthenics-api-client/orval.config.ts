import { defineConfig } from 'orval';

const SESSION_QUERIES = ['fetchSessions', 'fetchCurrentSession'];
const sessionQuery = { query: 'fetchSession', params: ['sessionId'] };
const templateQuery = { query: 'fetchTemplate', params: ['templateId'] };

// `pnpm generate`: models, fetch functions and React Query hooks from the API's OpenAPI document. Never edit
// src/generated/ by hand — change the API, run `pnpm --filter @bpagoaga/calisthenics-api openapi`, then regenerate.
export default defineConfig({
  calibuddy: {
    input: { target: '../../apps/calisthenics-api/openapi.json' },
    output: {
      // One endpoints file: mutations invalidate queries of other tags (deleting a template frees programme days).
      mode: 'single',
      target: 'src/generated/endpoints.ts',
      schemas: 'src/generated/models',
      client: 'react-query',
      httpClient: 'fetch',
      clean: true,
      override: {
        mutator: { path: 'src/apiFetch.ts', name: 'apiFetch' },
        // Hooks return the response body (the mutator throws `ApiError` on any error status).
        fetch: { includeHttpResponseReturnType: false },
        query: {
          version: 5,
          shouldExportKeys: true,
          // Every mutation refreshes the queries it changes: screens never show stale data after a write.
          mutationInvalidates: [
            { onMutations: ['updateProfile'], invalidates: ['fetchProfile'] },
            { onMutations: ['createTemplate', 'duplicateTemplate'], invalidates: ['fetchTemplates'] },
            { onMutations: ['updateTemplate', 'addTemplateItem'], invalidates: ['fetchTemplates', templateQuery] },
            {
              onMutations: ['deleteTemplate'],
              invalidates: ['fetchTemplates', 'fetchProgramme', ...SESSION_QUERIES],
            },
            { onMutations: ['setProgrammeDay'], invalidates: ['fetchProgramme'] },
            { onMutations: ['startSession'], invalidates: SESSION_QUERIES },
            {
              onMutations: ['logSet', 'removeLastSet', 'addSessionExercise', 'finishSession', 'deleteSession'],
              invalidates: [...SESSION_QUERIES, sessionQuery],
            },
            { onMutations: ['setProgressStep'], invalidates: ['fetchProgress'] },
            { onMutations: ['createLevelTest'], invalidates: ['fetchLevelTests', 'fetchProgress'] },
            {
              onMutations: ['importData'],
              invalidates: [
                'fetchProfile',
                'fetchTemplates',
                'fetchProgramme',
                ...SESSION_QUERIES,
                'fetchProgress',
                'fetchLevelTests',
              ],
            },
          ],
        },
      },
    },
  },
});
