import type { InputHTMLAttributes } from 'react';

export interface ITextField extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  id: string;
  label: string;
  /** Shown under the field, linked with `aria-describedby`. */
  hint?: string;
}
