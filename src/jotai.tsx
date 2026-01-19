import { createScopeFromContext } from "bunja/react";
import { Provider, createStore, getDefaultStore } from "jotai";
import type { Store } from "jotai/vanilla/store";
import { PropsWithChildren, createContext, useState } from "react";

export const JotaiStoreContext = createContext<Store>(getDefaultStore());
export const JotaiStoreScope = createScopeFromContext(JotaiStoreContext);

export function JotaiProvider({ children }: PropsWithChildren) {
  const [store] = useState(createStore);
  return (
    <JotaiStoreContext value={store}>
      <Provider store={store}>{children}</Provider>
    </JotaiStoreContext>
  );
}
