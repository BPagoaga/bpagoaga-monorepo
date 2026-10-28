import type { IProfile } from '../domain/types';
import { getDb } from './schema';

export const getProfile = async (): Promise<IProfile> => (await (await getDb()).get('profile', 'me')) ?? { id: 'me' };

export const updateProfile = async (changes: Partial<Omit<IProfile, 'id'>>) => {
  const profile = { ...(await getProfile()), ...changes };
  await (await getDb()).put('profile', profile);
  return profile;
};
