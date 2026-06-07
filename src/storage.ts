export function getSessionStorage(): Storage | undefined {
  if (!("sessionStorage" in globalThis)) return;
  return globalThis.sessionStorage;
}

export function getLocalStorage(): Storage | undefined {
  if (!("localStorage" in globalThis)) return;
  return globalThis.localStorage;
}

export function createMemoryStorage(): Storage {
  const items = new Map<string, string>();
  return {
    get length() {
      return items.size;
    },
    clear() {
      items.clear();
    },
    getItem(key) {
      return items.get(key) ?? null;
    },
    key(index) {
      return Array.from(items.keys())[index] ?? null;
    },
    removeItem(key) {
      items.delete(key);
    },
    setItem(key, value) {
      items.set(key, value);
    },
  };
}
