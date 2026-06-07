import { type Atom, atom } from "jotai";

import { Loader } from "./loader";
import type { JotaiStore } from "./store";
import { waitIndefinitely, waitSingleTick } from "./wait";

export interface Resource<T, E extends Error> {
  load: () => Promise<void>;
  loadingAtom: Atom<boolean>;
  phaseAtom: Atom<ResourcePhase<T, E>>;
  valueAtom: Atom<T | undefined>;
  asyncValueAtom: Atom<T | Promise<T>>;
}

export type ResourcePhase<T, E extends Error> =
  | { phase: "no-data" }
  | ResourceDataPhase<T>
  | ResourceErrorPhase<E>;
interface ResourceDataPhase<T> {
  phase: "data";
  data: T;
  key: string;
}
interface ResourceErrorPhase<E extends Error> {
  phase: "error";
  error: E;
  key: string;
}

export interface CreateResourceConfig<Query, T> {
  store: JotaiStore;
  signal: AbortSignal;
  loader: Loader<Query, T>;
  queryAtom?: Atom<Query>;
}

export function createResource<
  Query = void,
  T = unknown,
  E extends Error = Error,
>({
  store,
  signal,
  loader,
  queryAtom = atom(undefined as Query),
}: CreateResourceConfig<Query, T>): Resource<T, E> {
  const initialQuery = store.get(queryAtom);
  const initialKey = loader.getKey(initialQuery);
  let loading: { key: string; promise: Promise<void> } | undefined;
  const loadingAtom = atom(false);

  const phaseAtom = atom<ResourcePhase<T, E>>(
    loader.hasCache(initialQuery)
      ? {
          phase: "data",
          data: loader.getCachedData(initialQuery)!,
          key: initialKey,
        }
      : { phase: "no-data" },
  );
  const dataPhaseAtom = atom<ResourceDataPhase<T> | undefined>((get) => {
    const phase = get(phaseAtom);
    if (phase.phase !== "data") return;
    if (phase.key !== loader.getKey(get(queryAtom))) return;
    return phase;
  });

  const valueAtom = atom<T | undefined>((get) => {
    const dataPhase = get(dataPhaseAtom);
    if (!dataPhase) return;
    return dataPhase.data;
  });
  const asyncValueAtom = atom((get) => {
    const readKey = loader.getKey(get(queryAtom));
    const dataPhase = get(dataPhaseAtom);
    if (dataPhase) return dataPhase.data;
    // If load is called synchronously, doLoad calls store.set while the atom
    // is still being read, so defer the load by one tick.
    return waitSingleTick()
      .then(load)
      .then(() => {
        const phase = get(phaseAtom);
        const currentKey = loader.getKey(get(queryAtom));
        if (currentKey !== readKey) return waitIndefinitely<T>();
        if (phase.phase === "no-data" || phase.key !== currentKey) {
          throw new Error("Unexpected no-data.");
        }
        if (phase.phase === "error") throw phase.error;
        return phase.data;
      });
  });

  async function doLoad(query: Query, key: string) {
    try {
      store.set(loadingAtom, true);
      const data = await loader.load(query, signal);
      if (loader.getKey(store.get(queryAtom)) === key) {
        store.set(phaseAtom, { phase: "data", data, key });
      }
    } catch (err) {
      if (loader.getKey(store.get(queryAtom)) === key) {
        store.set(phaseAtom, { phase: "error", error: err as E, key });
      }
    } finally {
      if (loading?.key === key) {
        loading = undefined;
        store.set(loadingAtom, false);
      }
    }
  }

  function load() {
    const query = store.get(queryAtom);
    const key = loader.getKey(query);
    if (loading?.key === key) return loading.promise;
    const promise = doLoad(query, key);
    loading = { key, promise };
    return promise;
  }

  return {
    load,
    loadingAtom,
    phaseAtom,
    valueAtom,
    asyncValueAtom,
  };
}
