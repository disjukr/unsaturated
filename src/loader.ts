import { createMemoryStorage, getSessionStorage } from "./storage";

export interface Loader<Query, T> {
  getKey: (query: Query) => string;
  hasCache: (query: Query) => boolean;
  getCachedData: (query: Query) => T | undefined;
  setCachedData: (query: Query, data: T) => void;
  load: (query: Query, signal: AbortSignal) => Promise<T>;
  unload: (query: Query) => void;
}

const noResolve = new Promise(() => void 0);

export function createDummyLoader<Query = void, T = any>(): Loader<Query, T> {
  return createNaiveLoader(() => noResolve as Promise<T>);
}

export function createNaiveLoader<Query = void, T = any>(
  load: (query: Query, signal: AbortSignal) => Promise<T>,
): Loader<Query, T> {
  return {
    getKey: () => "",
    hasCache: () => false,
    getCachedData: () => void 0,
    setCachedData: () => void 0,
    load,
    unload: () => void 0,
  };
}

export interface CreateMemoizedLoaderConfig<Query, T> {
  getKey: (query: Query) => string;
  load: (query: Query, signal: AbortSignal) => Promise<T>;
}

export function createMemoizedLoader<Query, T>({
  getKey,
  load: outerLoad,
}: CreateMemoizedLoaderConfig<Query, T>): Loader<Query, T> {
  let memo: { key: string; data?: T; promise?: Promise<T> } | undefined;
  return {
    getKey,
    hasCache(query) {
      const key = getKey(query);
      return memo?.key === key && "data" in memo;
    },
    getCachedData(query) {
      const key = getKey(query);
      if (memo?.key === key && "data" in memo) return memo.data;
    },
    setCachedData(query, data) {
      const key = getKey(query);
      memo = { key, data };
    },
    load(query, signal) {
      const key = getKey(query);
      if (memo?.key === key) {
        if ("data" in memo) return Promise.resolve(memo.data as T);
        if (memo.promise) return memo.promise;
      }
      const promise = outerLoad(query, signal).then((data) => {
        if (memo?.key === key && memo.promise === promise) memo = { key, data };
        return data;
      });
      memo = { key, promise };
      return promise;
    },
    unload(query) {
      if (memo?.key === getKey(query)) memo = undefined;
    },
  };
}

export interface CreateCachedJsonLoaderConfig<Query, T> {
  getKey: (query: Query) => string;
  fetchJson: (query: Query, signal: AbortSignal) => Promise<string>;
  parseJson: (json: string, query: Query) => T;
  storage?: Storage;
}

export function createCachedJsonLoader<Query, T>({
  getKey,
  fetchJson,
  parseJson,
  storage = getSessionStorage() ?? createMemoryStorage(),
}: CreateCachedJsonLoaderConfig<Query, T>): Loader<Query, T> {
  return {
    getKey,
    hasCache(query) {
      return storage?.getItem(getKey(query)) != null;
    },
    getCachedData(query) {
      const key = getKey(query);
      const cachedJson = storage?.getItem(key);
      if (cachedJson == null) return;
      try {
        return parseJson(cachedJson, query);
      } catch {
        storage?.removeItem(key);
      }
    },
    setCachedData(query, data) {
      const key = getKey(query);
      const json = JSON.stringify(data);
      storage?.setItem(key, json);
    },
    async load(query, signal) {
      const key = getKey(query);
      const json = await fetchJson(query, signal);
      const data = parseJson(json, query);
      storage?.setItem(key, json);
      return data;
    },
    unload(query) {
      storage?.removeItem(getKey(query));
    },
  };
}
