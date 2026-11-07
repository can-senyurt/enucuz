/**
 * A template re-mounts on every navigation (a layout does not), which gives
 * every page a soft fade-up when you move between pages.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
