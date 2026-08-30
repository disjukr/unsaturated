import { RouterProvider } from "@tanstack/react-router";
import { BunjaStoreProvider } from "bunja/react";
import { createRoot } from "react-dom/client";
import { JotaiProvider } from "unsaturated/store";
import "virtual:uno.css";

import "./index.css";
import { router } from "./router";

createRoot(document.getElementById("root")!).render(
  <BunjaStoreProvider>
    <JotaiProvider>
      <RouterProvider router={router} />
    </JotaiProvider>
  </BunjaStoreProvider>,
);
