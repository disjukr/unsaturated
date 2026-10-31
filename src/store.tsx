import type { Scope } from "bunja";
import { createScopeFromContext } from "bunja/react";
import { Provider, createStore, getDefaultStore } from "jotai";
import { PropsWithChildren, createContext, useState } from "react";

type Store = ReturnType<typeof createStore>;

export type { Store as JotaiStore };

export const JotaiStoreContext: React.Context<Store> =
  createContext<Store>(getDefaultStore());
export const JotaiStoreScope: Scope<Store> =
  createScopeFromContext(JotaiStoreContext);

export function JotaiProvider({ children }: PropsWithChildren) {
  const [store] = useState(createStore);
  return (
    <JotaiStoreContext value={store}>
      <Provider store={store}>{children}</Provider>
    </JotaiStoreContext>
  );
}
