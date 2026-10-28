import { faPersonRunning } from '@fortawesome/free-solid-svg-icons';
import Icon from '../Icon';

/** Logo + name, as in the app nav and onboarding header. */
const Brand = () => (
  <span className="flex items-center gap-2.5">
    <span className="grid size-9 place-items-center rounded-lg bg-accent-100 text-neutral-150" aria-hidden="true">
      <Icon icon={faPersonRunning} className="size-4" />
    </span>
    <span className="font-display text-title-s">
      Cali<span className="text-accent-110">Buddy</span>
    </span>
  </span>
);

export default Brand;
