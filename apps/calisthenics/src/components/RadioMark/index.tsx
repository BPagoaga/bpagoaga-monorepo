import { faCheck } from '@fortawesome/free-solid-svg-icons';
import Icon from '../Icon';

/** The round check of a radio card; follows `:checked` of the input inside the same `group` label. */
const RadioMark = () => (
  <span
    className="grid size-6 shrink-0 place-items-center rounded-full border-2 border-neutral-60 group-has-checked:border-accent-110 group-has-checked:bg-accent-100"
    aria-hidden="true"
  >
    <Icon icon={faCheck} className="hidden size-3 text-neutral-150 group-has-checked:inline" />
  </span>
);

export default RadioMark;
