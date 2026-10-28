import AppNav from '../AppNav';
import type { IPageLayout } from './types';

export type * from './types';

/** App screen with the main navigation; the content leaves room for the sidebar (lg) or the tab bar. */
const PageLayout = ({ children, className = 'space-y-8' }: IPageLayout) => (
  <>
    <AppNav />
    <div className="pb-28 lg:pb-0 lg:pl-64">
      <main className={`mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8 ${className}`}>{children}</main>
    </div>
  </>
);

export default PageLayout;
