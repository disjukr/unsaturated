import { Link, Outlet, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => <p className="not-found">Example not found.</p>,
});

function RootLayout() {
  return (
    <>
      <nav className="app-nav" aria-label="Examples">
        <Link to="/" activeOptions={{ exact: true }}>
          Unsaturated examples
        </Link>
      </nav>
      <Outlet />
    </>
  );
}
