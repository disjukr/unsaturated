import { createFileRoute } from "@tanstack/react-router";

import { NowExample } from "../examples/now/NowExample";

export const Route = createFileRoute("/now")({
  component: NowExample,
});
