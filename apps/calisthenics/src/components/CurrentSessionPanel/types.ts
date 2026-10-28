import type { ISession } from '../../domain/types';

export interface ICurrentSessionPanel {
  session: ISession;
  /** Compact: inside the journal's side column (desktop). */
  compact?: boolean;
}
