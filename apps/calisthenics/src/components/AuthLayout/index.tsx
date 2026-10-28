import Brand from '../Brand';
import type { IAuthLayout } from './types';

export type * from './types';

/** Sign-in and sign-up screens (MOCK-207): the brand, then one card centred on the page. */
const AuthLayout = ({ title, intro, children, footer }: IAuthLayout) => (
  <>
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex h-16 max-w-3xl items-center px-4">
        <Brand />
      </div>
    </header>
    <main className="mx-auto max-w-md px-4 py-10">
      <h1 className="font-display text-title-xl">{title}</h1>
      <p className="mt-2 text-body-m text-muted">{intro}</p>
      <div className="mt-6 rounded-2xl border border-border bg-surface p-5 shadow-elevation-1 sm:p-6">{children}</div>
      <p className="mt-6 text-center text-body-s text-muted">{footer}</p>
    </main>
  </>
);

export default AuthLayout;
