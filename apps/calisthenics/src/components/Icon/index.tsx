import type { IIcon } from './types';

export type * from './types';

/** Font Awesome icon rendered as inline SVG, sized by `className`. */
const Icon = ({ icon, className = 'size-4', title }: IIcon) => {
  const [width, height, , , path] = icon.icon;
  const paths = Array.isArray(path) ? path : [path];
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`shrink-0 ${className}`}
      fill="currentColor"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
};

export default Icon;
