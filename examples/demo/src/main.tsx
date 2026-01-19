import { BunjaStoreProvider } from "bunja/react";
import { createRoot } from "react-dom/client";
import { JotaiProvider } from "unsaturated/jotai";

import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <BunjaStoreProvider>
    <JotaiProvider>
      <App />
    </JotaiProvider>
  </BunjaStoreProvider>,
);
