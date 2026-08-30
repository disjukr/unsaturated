import { createFileRoute } from "@tanstack/react-router";

import { LoginExample } from "../examples/form/LoginExample";

export const Route = createFileRoute("/form")({
  component: LoginExample,
});
