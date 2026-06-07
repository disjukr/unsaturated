import { bunja } from "bunja";
import { createScopeFromContext } from "bunja/react";
import { type Atom, atom } from "jotai";
import { createContext } from "react";

import { JotaiStoreScope } from "./store";

export const NowFnContext = createContext(Date.now);
export const NowFnScope = createScopeFromContext(NowFnContext);

export const nowBunja = bunja(() => {
  const store = bunja.use(JotaiStoreScope);
  const nowFn = bunja.use(NowFnScope);

  const nowAtom = atom(nowFn());
  bunja.effect(() => startRafLoop(() => store.set(nowAtom, nowFn())));

  const nowEverySecondAtom = createNowEveryAtom(nowAtom, 1000);
  const nowEveryMinuteAtom = createNowEveryAtom(nowEverySecondAtom, 60000);
  const nowEveryUtcHourAtom = createNowEveryAtom(nowEveryMinuteAtom, 3600000);
  const nowEveryLocalHourAtom = createNowEveryLocalHourAtom(nowEveryMinuteAtom);
  const nowEveryUtcDayAtom = createNowEveryAtom(nowEveryUtcHourAtom, 86400000);
  const nowEveryLocalDayAtom = createNowEveryLocalDayAtom(nowEveryMinuteAtom);

  return {
    nowAtom,
    nowEverySecondAtom,
    nowEveryMinuteAtom,
    nowEveryUtcHourAtom,
    nowEveryLocalHourAtom,
    nowEveryUtcDayAtom,
    nowEveryLocalDayAtom,
  };
});

interface StartRafLoopConfig {
  signal?: AbortSignal;
  onError?: (error: unknown) => void;
}
function startRafLoop(fn: () => void, config?: StartRafLoopConfig): () => void {
  const { signal, onError } = config ?? {};
  if (signal?.aborted) return () => {};
  let id: number | undefined;
  const stop = () => {
    if (id != null) cancelAnimationFrame(id);
    id = undefined;
  };
  function loop() {
    if (signal?.aborted) return;
    try {
      fn();
    } catch (error) {
      onError?.(error);
    } finally {
      if (signal?.aborted) return;
      id = requestAnimationFrame(loop);
    }
  }
  signal?.addEventListener("abort", stop, { once: true });
  id = requestAnimationFrame(loop);
  return stop;
}

function createNowEveryAtom(nowAtom: Atom<number>, intervalMs: number) {
  return atom((get) => Math.floor(get(nowAtom) / intervalMs) * intervalMs);
}

function createNowEveryLocalHourAtom(nowAtom: Atom<number>) {
  return atom((get) => {
    const now = new Date(get(nowAtom));
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
    ).getTime();
  });
}

function createNowEveryLocalDayAtom(nowAtom: Atom<number>) {
  return atom((get) => {
    const now = new Date(get(nowAtom));
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).getTime();
  });
}
