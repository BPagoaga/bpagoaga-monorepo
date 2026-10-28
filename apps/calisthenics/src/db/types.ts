import type { DBSchema } from 'idb';
import type {
  ILevelTestResult,
  IProfile,
  IProgramme,
  IProgressionProgress,
  ISession,
  ISessionTemplate,
} from '../domain/types';

export interface ICaliBuddyDB extends DBSchema {
  profile: { key: 'me'; value: IProfile };
  templates: { key: string; value: ISessionTemplate; indexes: { name: string } };
  programme: { key: 'current'; value: IProgramme };
  sessions: { key: string; value: ISession; indexes: { startedAt: string; templateId: string } };
  progress: { key: string; value: IProgressionProgress };
  levelTests: { key: string; value: ILevelTestResult; indexes: { takenAt: string } };
}

export type StoreName = 'profile' | 'templates' | 'programme' | 'sessions' | 'progress' | 'levelTests';
