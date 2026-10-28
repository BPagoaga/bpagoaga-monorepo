import type {
  IProgressHistoryEntry,
  ISessionExercise,
  ITemplateItem,
  LevelTestResults,
} from '@bpagoaga/calisthenics-core/domain/types';
import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { user } from './auth-schema';

export * from './auth-schema';

// Every table belongs to one user and goes with them (`on delete cascade`). Ordered lists that are always read and
// written whole (template items, a session's exercises and sets, a progression's history) are `jsonb` documents,
// typed with the core types and validated by the API schemas before they are written.

const userId = () =>
  text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' });
const createdAt = () => timestamp('created_at', { withTimezone: true }).notNull().defaultNow();

/** One row per user, created with the account. The first name is the account's `user.name`. */
export const profiles = pgTable('profiles', {
  userId: text('user_id')
    .primaryKey()
    .references(() => user.id, { onDelete: 'cascade' }),
  goalProgressionId: text('goal_progression_id'),
  onboardedAt: timestamp('onboarded_at', { withTimezone: true }),
});

export const templates = pgTable(
  'templates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: userId(),
    name: text('name').notNull(),
    items: jsonb('items').$type<ITemplateItem[]>().notNull(),
    createdAt: createdAt(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('templates_user_created_idx').on(table.userId, table.createdAt)],
);

/** Seven rows per user (Monday = 0 … Sunday = 6); a null template is a rest day. */
export const programmeDays = pgTable(
  'programme_days',
  {
    userId: userId(),
    dayIndex: smallint('day_index').notNull(),
    templateId: uuid('template_id').references(() => templates.id, { onDelete: 'set null' }),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.dayIndex] }),
    check('programme_days_day_index_check', sql`${table.dayIndex} between 0 and 6`),
  ],
);

export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: userId(),
    templateId: uuid('template_id').references(() => templates.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    endedAt: timestamp('ended_at', { withTimezone: true }),
    rpe: smallint('rpe'),
    feeling: text('feeling', { enum: ['great', 'ok', 'hard'] }),
    notes: text('notes'),
    exercises: jsonb('exercises').$type<ISessionExercise[]>().notNull(),
  },
  (table) => [
    index('sessions_user_started_idx').on(table.userId, table.startedAt),
    // Only one session in progress per user.
    uniqueIndex('sessions_one_running_idx')
      .on(table.userId)
      .where(sql`${table.endedAt} is null`),
  ],
);

export const progress = pgTable(
  'progress',
  {
    userId: userId(),
    progressionId: text('progression_id').notNull(),
    currentStep: integer('current_step').notNull(),
    history: jsonb('history').$type<IProgressHistoryEntry[]>().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.progressionId] })],
);

export const levelTests = pgTable(
  'level_tests',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: userId(),
    takenAt: timestamp('taken_at', { withTimezone: true }).notNull().defaultNow(),
    results: jsonb('results').$type<LevelTestResults>().notNull(),
  },
  (table) => [index('level_tests_user_taken_idx').on(table.userId, table.takenAt)],
);
