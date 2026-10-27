/**
 * Spacing on Tailwind's 4 dp grid, so `space(4)` matches the web's `p-4` / `gap-4` (1rem).
 * Use it for every margin, padding and gap instead of raw numbers.
 */
export const space = (step: number) => step * 4;
