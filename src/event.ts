export type EventListener<TEvent> = (event: TEvent) => void;

export interface EventEmitter<TEvents extends object> {
  emit: <TKey extends keyof TEvents>(key: TKey, event: TEvents[TKey]) => void;
  off: <TKey extends keyof TEvents>(
    key: TKey,
    listener?: EventListener<TEvents[TKey]>,
  ) => void;
  on: <TKey extends keyof TEvents>(
    key: TKey,
    listener: EventListener<TEvents[TKey]>,
  ) => () => void;
}

type AnyEventListener = (event: unknown) => void;

export function createEventEmitter<
  TEvents extends object,
>(): EventEmitter<TEvents> {
  const listeners = new Map<keyof TEvents, Set<AnyEventListener>>();

  function off<TKey extends keyof TEvents>(
    key: TKey,
    listener?: EventListener<TEvents[TKey]>,
  ) {
    if (!listener) {
      listeners.delete(key);
      return;
    }
    const eventListeners = listeners.get(key);
    if (!eventListeners) return;
    eventListeners.delete(listener as AnyEventListener);
    if (eventListeners.size === 0) listeners.delete(key);
  }
  return {
    emit(key, event) {
      listeners.get(key)?.forEach((listener) => listener(event));
    },
    off,
    on(key, listener) {
      const eventListeners = listeners.get(key) ?? new Set<AnyEventListener>();
      const typedListener = listener as AnyEventListener;
      eventListeners.add(typedListener);
      listeners.set(key, eventListeners);
      return () => off(key, listener);
    },
  };
}
