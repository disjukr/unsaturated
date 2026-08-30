import { useBunja } from "bunja/react";
import { type Atom, type PrimitiveAtom, useAtom, useAtomValue } from "jotai";
import { type ReactNode, useRef } from "react";
import { nowBunja, seededZonedNowBunja } from "unsaturated/now";

const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC";
const demoTimeZoneOptions = [
  {
    value: "UTC",
    description: "Baseline with no time zone offset or DST transitions.",
  },
  {
    value: localTimeZone,
    description: "Your browser's local time zone.",
  },
  {
    value: "Asia/Kolkata",
    description:
      "Uses a 30-minute offset (UTC+05:30), so local boundaries are minute-offset.",
  },
  {
    value: "Australia/Melbourne",
    description:
      "Uses southern hemisphere DST, where transition months differ from northern zones.",
  },
  {
    value: "America/New_York",
    description:
      "Uses DST with skipped spring-forward hours and repeated fall-back hours.",
  },
].filter(
  (option, index, options) =>
    options.findIndex((item) => item.value === option.value) === index,
);

type TimeZoneAtom = PrimitiveAtom<string>;
type TimestampAtom = Atom<number>;
type Tone = "indigo" | "sky" | "amber" | "rose" | "violet" | "emerald";

const toneClasses: Record<Tone, string> = {
  indigo: "bg-indigo-500 shadow-indigo-200",
  sky: "bg-sky-500 shadow-sky-200",
  amber: "bg-amber-400 shadow-amber-200",
  rose: "bg-rose-500 shadow-rose-200",
  violet: "bg-violet-500 shadow-violet-200",
  emerald: "bg-emerald-500 shadow-emerald-200",
};

function RenderCounter() {
  const renderCount = useRef(0);
  renderCount.current += 1;

  return (
    <span
      key={renderCount.current}
      className="shrink-0 animate-render-count rounded-full bg-rose-50 px-2.5 py-1 font-mono text-[0.625rem] font-bold uppercase tracking-wider text-rose-600 ring-1 ring-rose-100 motion-reduce:animate-none"
    >
      <span className="tabular-nums">{renderCount.current}</span> renders
    </span>
  );
}

function AtomPanel({
  title,
  eyebrow,
  description,
  tone,
  children,
}: {
  title: string;
  eyebrow: string;
  description: string;
  tone: Tone;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-[0_20px_55px_-35px_rgba(30,41,59,0.5)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_-34px_rgba(30,41,59,0.55)]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <span
            className={`mb-4 block h-1.5 w-9 rounded-full shadow-lg ${toneClasses[tone]}`}
          />
          <p className="mb-1.5 mt-0 text-[0.625rem] font-bold uppercase tracking-[0.18em] text-slate-400">
            {eyebrow}
          </p>
          <h2 className="m-0 text-lg font-black tracking-tight text-slate-900">
            {title}
          </h2>
          <p className="mb-0 mt-2 max-w-sm text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>
        <RenderCounter />
      </div>
      {children}
    </section>
  );
}

function AtomValue({
  name,
  timestamp,
  preview,
}: {
  name: string;
  timestamp: number;
  preview: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-slate-950 px-4 py-3.5 text-slate-200 ring-1 ring-slate-800">
      <code className="block overflow-x-auto text-xs leading-5">
        <span className="text-indigo-300">{name}</span>
        <span className="text-slate-500"> = </span>
        <span className="text-white">{timestamp}</span>
      </code>
      <p className="mb-0 mt-2 truncate text-xs text-slate-400">{preview}</p>
    </div>
  );
}

function NowAtomDisplay() {
  const { nowAtom } = useBunja(nowBunja);
  const now = useAtomValue(nowAtom);

  return (
    <AtomPanel
      title="Animation frame"
      eyebrow="Real time"
      description="Updates on every requestAnimationFrame for frame-level time."
      tone="indigo"
    >
      <AtomValue
        name="nowAtom"
        timestamp={now}
        preview={new Date(now).toLocaleTimeString()}
      />
    </AtomPanel>
  );
}

function NowEverySecondDisplay() {
  const { nowEverySecondAtom } = useBunja(nowBunja);
  const now = useAtomValue(nowEverySecondAtom);

  return (
    <AtomPanel
      title="Every second"
      eyebrow="Interval"
      description="Updates once per second (1,000 ms)."
      tone="sky"
    >
      <AtomValue
        name="nowEverySecondAtom"
        timestamp={now}
        preview={new Date(now).toLocaleTimeString()}
      />
    </AtomPanel>
  );
}

function NowEveryMinuteDisplay() {
  const { nowEveryMinuteAtom } = useBunja(nowBunja);
  const now = useAtomValue(nowEveryMinuteAtom);

  return (
    <AtomPanel
      title="Every minute"
      eyebrow="Interval"
      description="Updates once per minute (60,000 ms)."
      tone="amber"
    >
      <AtomValue
        name="nowEveryMinuteAtom"
        timestamp={now}
        preview={new Date(now).toLocaleTimeString()}
      />
    </AtomPanel>
  );
}

function NowEveryUtcHourDisplay() {
  const { nowEveryUtcHourAtom } = useBunja(nowBunja);
  const now = useAtomValue(nowEveryUtcHourAtom);

  return (
    <AtomPanel
      title="UTC hour"
      eyebrow="Boundary"
      description="Updates at each UTC hour boundary (3,600,000 ms)."
      tone="rose"
    >
      <AtomValue
        name="nowEveryUtcHourAtom"
        timestamp={now}
        preview={new Date(now).toLocaleString()}
      />
    </AtomPanel>
  );
}

function NowEveryLocalHourDisplay() {
  const { nowEveryLocalHourAtom } = useBunja(nowBunja);
  const now = useAtomValue(nowEveryLocalHourAtom);

  return (
    <AtomPanel
      title="Local hour"
      eyebrow="Boundary"
      description="Updates at each hour boundary in the browser's local time zone."
      tone="rose"
    >
      <AtomValue
        name="nowEveryLocalHourAtom"
        timestamp={now}
        preview={new Date(now).toLocaleString()}
      />
    </AtomPanel>
  );
}

function NowEveryUtcDayDisplay() {
  const { nowEveryUtcDayAtom } = useBunja(nowBunja);
  const now = useAtomValue(nowEveryUtcDayAtom);

  return (
    <AtomPanel
      title="UTC day"
      eyebrow="Boundary"
      description="Updates at each UTC day boundary (86,400,000 ms)."
      tone="violet"
    >
      <AtomValue
        name="nowEveryUtcDayAtom"
        timestamp={now}
        preview={new Date(now).toLocaleString()}
      />
    </AtomPanel>
  );
}

function NowEveryLocalDayDisplay() {
  const { nowEveryLocalDayAtom } = useBunja(nowBunja);
  const now = useAtomValue(nowEveryLocalDayAtom);

  return (
    <AtomPanel
      title="Local day"
      eyebrow="Boundary"
      description="Updates at each day boundary in the browser's local time zone."
      tone="emerald"
    >
      <AtomValue
        name="nowEveryLocalDayAtom"
        timestamp={now}
        preview={new Date(now).toLocaleString()}
      />
    </AtomPanel>
  );
}

function NowEveryZonedDisplay() {
  const { timeZoneAtom, nowEveryZonedHourAtom, nowEveryZonedDayAtom } =
    useBunja(seededZonedNowBunja);

  return (
    <section className="col-span-full overflow-hidden rounded-3xl bg-slate-950 text-white shadow-[0_30px_80px_-40px_rgba(15,23,42,0.9)]">
      <div className="grid gap-8 p-7 sm:p-9 md:grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)]">
        <div>
          <p className="mb-2 mt-0 text-[0.625rem] font-bold uppercase tracking-[0.2em] text-sky-300">
            Selected time zone
          </p>
          <h2 className="m-0 text-2xl font-black tracking-tight">
            Zoned boundaries
          </h2>
          <p className="mb-0 mt-3 max-w-lg text-sm leading-6 text-slate-400">
            Change the region to see hour and day atoms align with local clock
            boundaries, including daylight saving transitions.
          </p>
          <ZonedTimeZoneDisplay timeZoneAtom={timeZoneAtom} />
        </div>
        <div className="grid content-start gap-3">
          <ZonedValue
            label="Hour boundary"
            description="Updates at each hour boundary in the selected time zone."
            timestampAtom={nowEveryZonedHourAtom}
            timeZoneAtom={timeZoneAtom}
          />
          <ZonedValue
            label="Day boundary"
            description="Updates at each day boundary in the selected time zone."
            timestampAtom={nowEveryZonedDayAtom}
            timeZoneAtom={timeZoneAtom}
          />
        </div>
      </div>
    </section>
  );
}

function ZonedTimeZoneDisplay({
  timeZoneAtom,
}: {
  timeZoneAtom: TimeZoneAtom;
}) {
  const [timeZone, setTimeZone] = useAtom(timeZoneAtom);
  return (
    <div className="mt-7">
      <label>
        <span className="mb-2 block text-xs font-bold text-slate-300">
          Time zone
        </span>
        <select
          className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-sky-400 focus:ring-3 focus:ring-sky-400/15"
          value={timeZone}
          onChange={(event) => setTimeZone(event.target.value)}
        >
          {demoTimeZoneOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.value}
            </option>
          ))}
        </select>
      </label>
      <ul className="mb-0 mt-4 grid list-none gap-2 p-0">
        {demoTimeZoneOptions.map((option) => (
          <li
            className={`rounded-xl px-3 py-2.5 text-xs leading-5 ring-1 transition ${option.value === timeZone ? "bg-sky-400/10 text-sky-100 ring-sky-400/25" : "bg-white/3 text-slate-500 ring-white/6"}`}
            key={option.value}
          >
            <strong className="mr-1 text-slate-300">{option.value}:</strong>
            {option.description}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ZonedValue({
  label,
  description,
  timestampAtom,
  timeZoneAtom,
}: {
  label: string;
  description: string;
  timestampAtom: TimestampAtom;
  timeZoneAtom: TimeZoneAtom;
}) {
  const timestamp = useAtomValue(timestampAtom);
  const timeZone = useAtomValue(timeZoneAtom);

  return (
    <div className="rounded-2xl bg-white/6 p-4 ring-1 ring-white/8">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        <RenderCounter />
      </div>
      <p className="mb-3 mt-0 text-xs leading-5 text-slate-500">
        {description}
      </p>
      <code className="block overflow-x-auto text-sm text-sky-300">
        {timestamp}ms
      </code>
      <p className="mb-0 mt-2 text-xs leading-5 text-slate-400">
        {new Date(timestamp).toLocaleString(undefined, {
          timeZone,
          timeZoneName: "short",
        })}
      </p>
    </div>
  );
}

export function NowExample() {
  return (
    <main className="mx-auto w-[min(68rem,calc(100%-3rem))] py-12 sm:py-20">
      <header className="mb-10 max-w-2xl">
        <p className="mb-3 mt-0 text-xs font-bold uppercase tracking-[0.2em] text-sky-600">
          Reactive time atoms
        </p>
        <h1 className="m-0 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
          Time, exactly when you need it.
        </h1>
        <p className="mb-0 mt-4 text-base leading-7 text-slate-500">
          Each card subscribes to a different clock boundary. Render counters
          make update frequency visible at a glance.
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        <NowAtomDisplay />
        <NowEverySecondDisplay />
        <NowEveryMinuteDisplay />
        <NowEveryUtcHourDisplay />
        <NowEveryLocalHourDisplay />
        <NowEveryUtcDayDisplay />
        <NowEveryLocalDayDisplay />
        <NowEveryZonedDisplay />
      </div>
    </main>
  );
}
