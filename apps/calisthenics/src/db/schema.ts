import { type IDBPDatabase, openDB } from 'idb';
import { DEFAULT_TEMPLATES } from '../content/templates';
import type { ICaliBuddyDB } from './types';

export * from './types';

export const DB_NAME = 'calibuddy';
export const SCHEMA_VERSION = 1;

let connection: Promise<IDBPDatabase<ICaliBuddyDB>> | undefined;

export const newId = () => crypto.randomUUID();
export const now = () => new Date().toISOString();

/** Opens the database once per page; migrations run in `upgrade`, one `if` per schema version. */
export const getDb = () => {
  connection ??= openDB<ICaliBuddyDB>(DB_NAME, SCHEMA_VERSION, {
    upgrade(db, oldVersion, _newVersion, transaction) {
      if (oldVersion < 1) {
        db.createObjectStore('profile', { keyPath: 'id' });
        db.createObjectStore('templates', { keyPath: 'id' }).createIndex('name', 'name');
        db.createObjectStore('programme', { keyPath: 'id' });
        const sessions = db.createObjectStore('sessions', { keyPath: 'id' });
        sessions.createIndex('startedAt', 'startedAt');
        sessions.createIndex('templateId', 'templateId');
        db.createObjectStore('progress', { keyPath: 'progressionId' });
        db.createObjectStore('levelTests', { keyPath: 'id' }).createIndex('takenAt', 'takenAt');

        // One millisecond apart: templates are listed by creation date.
        DEFAULT_TEMPLATES.forEach((template, index) => {
          const createdAt = new Date(Date.now() + index).toISOString();
          void transaction.objectStore('templates').add({ id: newId(), ...template, createdAt, updatedAt: createdAt });
        });
        void transaction
          .objectStore('programme')
          .add({ id: 'current', days: [null, null, null, null, null, null, null] });
      }
    },
  });
  return connection;
};

/** Tests only: forget the open connection so the next `getDb()` reopens a fresh database. */
export const closeDb = async () => {
  if (!connection) return;
  (await connection).close();
  connection = undefined;
};
