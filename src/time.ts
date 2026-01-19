import { bunja } from "bunja";
import { type Atom, atom } from "jotai";

import { JotaiStoreScope } from "./jotai";
import { startRafLoop } from "./misc/raf";

export const nowBunja = bunja(() => {
  const store = bunja.use(JotaiStoreScope);

  const nowAtom = atom(Date.now());
  bunja.effect(() => startRafLoop(() => store.set(nowAtom, Date.now())));

  const nowEverySecondAtom = createNowEveryAtom(nowAtom, 1000);
  const nowEveryMinuteAtom = createNowEveryAtom(nowEverySecondAtom, 60000);
  const nowEveryHourAtom = createNowEveryAtom(nowEveryMinuteAtom, 3600000);
  const nowEveryDayAtom = createNowEveryAtom(nowEveryHourAtom, 86400000);

  return {
    nowAtom,
    nowEverySecondAtom,
    nowEveryMinuteAtom,
    nowEveryHourAtom,
    nowEveryDayAtom,
  };
});

export const nowDateBunja = bunja(() => {
  const {
    nowAtom,
    nowEverySecondAtom,
    nowEveryMinuteAtom,
    nowEveryHourAtom,
    nowEveryDayAtom,
  } = bunja.use(nowBunja);

  const nowDateAtom = createNowDateEveryAtom(nowAtom);
  const nowDateEverySecondAtom = createNowDateEveryAtom(nowEverySecondAtom);
  const nowDateEveryMinuteAtom = createNowDateEveryAtom(nowEveryMinuteAtom);
  const nowDateEveryHourAtom = createNowDateEveryAtom(nowEveryHourAtom);
  const nowDateEveryDayAtom = createNowDateEveryAtom(nowEveryDayAtom);

  return {
    nowDateAtom,
    nowDateEverySecondAtom,
    nowDateEveryMinuteAtom,
    nowDateEveryHourAtom,
    nowDateEveryDayAtom,
  };
});

function createNowEveryAtom(nowAtom: Atom<number>, intervalMs: number) {
  return atom((get) => Math.floor(get(nowAtom) / intervalMs) * intervalMs);
}

function createNowDateEveryAtom(nowAtom: Atom<number>): Atom<Date> {
  return atom((get) => new Date(get(nowAtom)));
}
