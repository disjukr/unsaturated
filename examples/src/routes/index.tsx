import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: ExampleIndex,
});

function ExampleIndex() {
  return (
    <main className="example-index">
      <h1>Examples</h1>
      <ul>
        <li>
          <Link to="/form">
            <strong>Form</strong>
            <span>Zod login form with validation and state tracking</span>
          </Link>
        </li>
        <li>
          <Link to="/now">
            <strong>Now</strong>
            <span>Time atoms with intervals and time zones</span>
          </Link>
        </li>
      </ul>
    </main>
  );
}
