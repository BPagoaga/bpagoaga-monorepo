import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import Icon from '../Icon';
import type { IErrorMessage } from './types';

export type * from './types';

/** Inline error of a failed mutation or query; renders nothing without an error. */
const ErrorMessage = ({ error, className = '' }: IErrorMessage) => {
  if (!error) return null;
  const message = error instanceof Error ? error.message : 'Une erreur est survenue. Réessaie.';
  return (
    <p
      role="alert"
      className={`flex items-start gap-2 rounded-lg bg-red-10 px-3 py-2 text-body-s text-red-120 ${className}`}
    >
      <Icon icon={faTriangleExclamation} className="mt-0.5 size-3.5" />
      {message}
    </p>
  );
};

export default ErrorMessage;
