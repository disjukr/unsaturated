import { Link, Outlet, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => (
    <p className="p-8 text-center">Example not found.</p>
  ),
});

function RootLayout() {
  return (
    <>
      <header className="border-b border-white/70 bg-white/75 backdrop-blur-xl">
        <nav
          className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6"
          aria-label="Examples"
        >
          <Link
            className="group flex items-center gap-3 text-slate-900 no-underline"
            to="/"
            activeOptions={{ exact: true }}
          >
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-indigo-600 text-sm font-black text-white shadow-lg shadow-indigo-200 transition-transform group-hover:-rotate-6">
              U
            </span>
            <span className="text-sm font-bold tracking-tight">
              unsaturated
              <span className="ml-1.5 font-medium text-slate-400">
                examples
              </span>
            </span>
          </Link>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-slate-500 shadow-sm">
            Playground
          </span>
        </nav>
      </header>
      <Outlet />
    </>
  );
}
