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

export const TimeZoneContext = createContext("UTC");
export const TimeZoneScope = createScopeFromContext(TimeZoneContext);

export const scopedZonedNowBunja = bunja(() => {
  const timeZone = bunja.use(TimeZoneScope);
  const { nowEveryMinuteAtom } = bunja.use(nowBunja);

  const nowEveryZonedHourAtom = createNowEveryZonedHourAtom(
    nowEveryMinuteAtom,
    timeZone,
  );
  const nowEveryZonedDayAtom = createNowEveryZonedDayAtom(
    nowEveryMinuteAtom,
    timeZone,
  );

  return { nowEveryZonedHourAtom, nowEveryZonedDayAtom };
});

export const seededZonedNowBunja = bunja.withSeed("UTC", (initialTimeZone) => {
  const { nowEveryMinuteAtom } = bunja.use(nowBunja);
  const timeZoneAtom = atom(initialTimeZone);

  const nowEveryZonedHourAtom = createNowEveryZonedHourAtom(
    nowEveryMinuteAtom,
    timeZoneAtom,
  );
  const nowEveryZonedDayAtom = createNowEveryZonedDayAtom(
    nowEveryMinuteAtom,
    timeZoneAtom,
  );

  return { timeZoneAtom, nowEveryZonedHourAtom, nowEveryZonedDayAtom };
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
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  });
}

type TimeZoneInput = string | Atom<string>;

function createNowEveryZonedHourAtom(
  nowAtom: Atom<number>,
  timeZone: TimeZoneInput,
): Atom<number> {
  return createNowEveryZonedWallTimeAtom(
    nowAtom,
    timeZone,
    getZonedHourCacheKey,
    getZonedWallHourStartTime,
  );
}

function createNowEveryZonedDayAtom(
  nowAtom: Atom<number>,
  timeZone: TimeZoneInput,
): Atom<number> {
  return createNowEveryZonedWallTimeAtom(
    nowAtom,
    timeZone,
    getZonedDayCacheKey,
    getZonedWallDayStartTime,
  );
}

function createNowEveryZonedWallTimeAtom(
  nowAtom: Atom<number>,
  timeZone: TimeZoneInput,
  getCacheKey: (timeZone: string, time: ZonedWallTime) => string,
  getStartTime: (time: ZonedWallTime, timeZone: string) => number,
): Atom<number> {
  let lastKey: string | undefined;
  let lastStartTime: number | undefined;
  return atom((get) => {
    const now = get(nowAtom);
    const zone = typeof timeZone === "string" ? timeZone : get(timeZone);
    const wallTime = getZonedWallTime(now, zone);
    const key = getCacheKey(zone, wallTime);
    if (key !== lastKey || lastStartTime == null) {
      lastKey = key;
      lastStartTime = getStartTime(wallTime, zone);
    }
    return lastStartTime;
  });
}

interface ZonedWallTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  offsetMinutes: number;
}

function getZonedHourCacheKey(timeZone: string, time: ZonedWallTime): string {
  return `${timeZone}:${time.year}-${time.month}-${time.day}T${time.hour}@${time.offsetMinutes}`;
}

function getZonedDayCacheKey(timeZone: string, time: ZonedWallTime): string {
  return `${timeZone}:${time.year}-${time.month}-${time.day}`;
}

function getZonedWallHourStartTime(
  time: ZonedWallTime,
  timeZone: string,
): number {
  return getZonedWallTimeStartTime(time, timeZone, compareZonedWallHour);
}

function getZonedWallDayStartTime(
  time: ZonedWallTime,
  timeZone: string,
): number {
  return getZonedWallTimeStartTime(
    { ...time, hour: 0, offsetMinutes: 0 },
    timeZone,
    compareZonedWallClock,
  );
}

const oneDay = 86400000;
const zonedDaySearchMs = oneDay + oneDay / 2;
function getZonedWallTimeStartTime(
  target: ZonedWallTime,
  timeZone: string,
  compare: (a: ZonedWallTime, b: ZonedWallTime) => number,
): number {
  const utcStart = Date.UTC(
    target.year,
    target.month - 1,
    target.day,
    target.hour,
  );
  let low = utcStart - zonedDaySearchMs;
  let high = utcStart + zonedDaySearchMs;
  while (compare(getZonedWallTime(low, timeZone), target) >= 0) {
    low -= oneDay;
  }
  while (compare(getZonedWallTime(high, timeZone), target) < 0) {
    high += oneDay;
  }
  return bisect(
    low,
    high,
    (time) => compare(getZonedWallTime(time, timeZone), target) >= 0,
  );
}

function getZonedWallTime(
  time: number | Date,
  timeZone: string,
): ZonedWallTime {
  const date = new Date(time);
  const parts = getZonedWallTimeFormatter(timeZone).formatToParts(date);
  const year = getZonedWallTimePart(parts, "year");
  const month = getZonedWallTimePart(parts, "month");
  const day = getZonedWallTimePart(parts, "day");
  const hour = getZonedWallTimePart(parts, "hour");
  const minute = getZonedWallTimePart(parts, "minute");
  const second = getZonedWallTimePart(parts, "second");
  const wallTimeAsUtc = Date.UTC(year, month - 1, day, hour, minute, second);
  const offsetMinutes = Math.round((wallTimeAsUtc - date.getTime()) / 60000);
  return { year, month, day, hour, offsetMinutes };
}

const zonedWallTimeFormatters = new Map<string, Intl.DateTimeFormat>();
function getZonedWallTimeFormatter(timeZone: string) {
  if (zonedWallTimeFormatters.has(timeZone)) {
    return zonedWallTimeFormatters.get(timeZone)!;
  }
  const formatter = new Intl.DateTimeFormat("en-US-u-ca-gregory-nu-latn", {
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    month: "2-digit",
    second: "2-digit",
    timeZone,
    year: "numeric",
  });
  zonedWallTimeFormatters.set(timeZone, formatter);
  return formatter;
}

function getZonedWallTimePart(
  parts: Intl.DateTimeFormatPart[],
  type: "year" | "month" | "day" | "hour" | "minute" | "second",
): number {
  const part = parts.find((item) => item.type === type);
  if (!part) throw new Error(`Missing ${type} date part.`);
  return Number(part.value);
}

function compareZonedWallHour(a: ZonedWallTime, b: ZonedWallTime): number {
  return compareZonedWallClock(a, b) || b.offsetMinutes - a.offsetMinutes;
}

function compareZonedWallClock(a: ZonedWallTime, b: ZonedWallTime): number {
  return (
    a.year - b.year || a.month - b.month || a.day - b.day || a.hour - b.hour
  );
}

function bisect(low: number, high: number, test: (value: number) => boolean) {
  while (high - low > 1) {
    const mid = Math.floor((low + high) / 2);
    if (test(mid)) high = mid;
    else low = mid;
  }
  return high;
}
