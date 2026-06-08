import { useBunja } from "bunja/react";
import { type Atom, type PrimitiveAtom, useAtom, useAtomValue } from "jotai";
import { memo, useRef } from "react";
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

function RenderCounter() {
  const renderCount = useRef(0);
  renderCount.current += 1;

  return (
    <span
      style={{
        marginLeft: "10px",
        padding: "2px 8px",
        backgroundColor: "#ff6b6b",
        color: "white",
        borderRadius: "3px",
        fontSize: "12px",
        fontWeight: "bold",
      }}
    >
      Renders: {renderCount.current}
    </span>
  );
}

function NowAtomDisplay() {
  const { nowAtom } = useBunja(nowBunja);
  const now = useAtomValue(nowAtom);
  const formatTime = (timestamp: number) =>
    new Date(timestamp).toLocaleTimeString();

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>
        Real-time Updates (RAF)
        <RenderCounter />
      </h2>
      <div
        style={{
          padding: "10px",
          backgroundColor: "#f0f0f0",
          borderRadius: "5px",
        }}
      >
        <strong>nowAtom:</strong> {now}ms ({formatTime(now)})
      </div>
    </div>
  );
}

function NowEverySecondDisplay() {
  const { nowEverySecondAtom } = useBunja(nowBunja);
  const nowEverySecond = useAtomValue(nowEverySecondAtom);
  const formatTime = (timestamp: number) =>
    new Date(timestamp).toLocaleTimeString();

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>
        Every Second
        <RenderCounter />
      </h2>
      <div
        style={{
          padding: "10px",
          backgroundColor: "#e8f4f8",
          borderRadius: "5px",
        }}
      >
        <strong>nowEverySecondAtom:</strong> {nowEverySecond}ms (
        {formatTime(nowEverySecond)})
      </div>
    </div>
  );
}

function NowEveryMinuteDisplay() {
  const { nowEveryMinuteAtom } = useBunja(nowBunja);
  const nowEveryMinute = useAtomValue(nowEveryMinuteAtom);
  const formatTime = (timestamp: number) =>
    new Date(timestamp).toLocaleTimeString();

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>
        Every Minute
        <RenderCounter />
      </h2>
      <div
        style={{
          padding: "10px",
          backgroundColor: "#fff4e6",
          borderRadius: "5px",
        }}
      >
        <strong>nowEveryMinuteAtom:</strong> {nowEveryMinute}ms (
        {formatTime(nowEveryMinute)})
      </div>
    </div>
  );
}

function NowEveryUtcHourDisplay() {
  const { nowEveryUtcHourAtom } = useBunja(nowBunja);
  const nowEveryUtcHour = useAtomValue(nowEveryUtcHourAtom);
  const formatDateTime = (timestamp: number) =>
    new Date(timestamp).toLocaleString();

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>
        Every UTC Hour
        <RenderCounter />
      </h2>
      <div
        style={{
          padding: "10px",
          backgroundColor: "#ffe6f0",
          borderRadius: "5px",
        }}
      >
        <strong>nowEveryUtcHourAtom:</strong> {nowEveryUtcHour}ms (
        {formatDateTime(nowEveryUtcHour)})
      </div>
    </div>
  );
}

function NowEveryLocalHourDisplay() {
  const { nowEveryLocalHourAtom } = useBunja(nowBunja);
  const nowEveryLocalHour = useAtomValue(nowEveryLocalHourAtom);
  const formatDateTime = (timestamp: number) =>
    new Date(timestamp).toLocaleString();

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>
        Every Local Hour
        <RenderCounter />
      </h2>
      <div
        style={{
          padding: "10px",
          backgroundColor: "#ffe6f0",
          borderRadius: "5px",
        }}
      >
        <strong>nowEveryLocalHourAtom:</strong> {nowEveryLocalHour}ms (
        {formatDateTime(nowEveryLocalHour)})
      </div>
    </div>
  );
}

function NowEveryUtcDayDisplay() {
  const { nowEveryUtcDayAtom } = useBunja(nowBunja);
  const nowEveryUtcDay = useAtomValue(nowEveryUtcDayAtom);
  const formatDateTime = (timestamp: number) =>
    new Date(timestamp).toLocaleString();

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>
        Every UTC Day
        <RenderCounter />
      </h2>
      <div
        style={{
          padding: "10px",
          backgroundColor: "#f0e6ff",
          borderRadius: "5px",
        }}
      >
        <strong>nowEveryUtcDayAtom:</strong> {nowEveryUtcDay}ms (
        {formatDateTime(nowEveryUtcDay)})
      </div>
    </div>
  );
}

function NowEveryLocalDayDisplay() {
  const { nowEveryLocalDayAtom } = useBunja(nowBunja);
  const nowEveryLocalDay = useAtomValue(nowEveryLocalDayAtom);
  const formatDateTime = (timestamp: number) =>
    new Date(timestamp).toLocaleString();

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>
        Every Local Day
        <RenderCounter />
      </h2>
      <div
        style={{
          padding: "10px",
          backgroundColor: "#e6fff2",
          borderRadius: "5px",
        }}
      >
        <strong>nowEveryLocalDayAtom:</strong> {nowEveryLocalDay}ms (
        {formatDateTime(nowEveryLocalDay)})
      </div>
    </div>
  );
}

function NowEveryZonedDisplay() {
  const { timeZoneAtom, nowEveryZonedHourAtom, nowEveryZonedDayAtom } =
    useBunja(seededZonedNowBunja);

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>Zoned Now</h2>
      <div
        style={{
          padding: "10px",
          backgroundColor: "#eef7ff",
          borderRadius: "5px",
        }}
      >
        <ZonedTimeZoneDisplay timeZoneAtom={timeZoneAtom} />
        <ZonedHourDisplay
          nowEveryZonedHourAtom={nowEveryZonedHourAtom}
          timeZoneAtom={timeZoneAtom}
        />
        <ZonedDayDisplay
          nowEveryZonedDayAtom={nowEveryZonedDayAtom}
          timeZoneAtom={timeZoneAtom}
        />
      </div>
    </div>
  );
}

function ZonedTimeZoneDisplay({
  timeZoneAtom,
}: {
  timeZoneAtom: TimeZoneAtom;
}) {
  const [timeZone, setTimeZone] = useAtom(timeZoneAtom);

  return (
    <div>
      <label>
        <strong>timeZoneAtom:</strong>{" "}
        <select
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
      <ul style={{ margin: "8px 0 0", color: "#555", fontSize: "12px" }}>
        {demoTimeZoneOptions.map((option) => (
          <li key={option.value}>
            <strong>{option.value}:</strong> {option.description}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ZonedHourDisplay({
  nowEveryZonedHourAtom,
  timeZoneAtom,
}: {
  nowEveryZonedHourAtom: TimestampAtom;
  timeZoneAtom: TimeZoneAtom;
}) {
  const timeZone = useAtomValue(timeZoneAtom);

  return (
    <div style={{ marginTop: "6px" }}>
      <strong>nowEveryZonedHourAtom:</strong>{" "}
      <ZonedTimestampValue timestampAtom={nowEveryZonedHourAtom} />{" "}
      <ZonedTimestampPreview
        timestampAtom={nowEveryZonedHourAtom}
        timeZone={timeZone}
      />
    </div>
  );
}

function ZonedDayDisplay({
  nowEveryZonedDayAtom,
  timeZoneAtom,
}: {
  nowEveryZonedDayAtom: TimestampAtom;
  timeZoneAtom: TimeZoneAtom;
}) {
  const timeZone = useAtomValue(timeZoneAtom);

  return (
    <div style={{ marginTop: "6px" }}>
      <strong>nowEveryZonedDayAtom:</strong>{" "}
      <ZonedTimestampValue timestampAtom={nowEveryZonedDayAtom} />{" "}
      <ZonedTimestampPreview
        timestampAtom={nowEveryZonedDayAtom}
        timeZone={timeZone}
      />
    </div>
  );
}

const ZonedTimestampValue = memo(function ZonedTimestampValue({
  timestampAtom,
}: {
  timestampAtom: TimestampAtom;
}) {
  const timestamp = useAtomValue(timestampAtom);

  return (
    <>
      {timestamp}ms
      <RenderCounter />
    </>
  );
});

function ZonedTimestampPreview({
  timestampAtom,
  timeZone,
}: {
  timestampAtom: TimestampAtom;
  timeZone: string;
}) {
  const timestamp = useAtomValue(timestampAtom);

  return (
    <>
      (
      {new Date(timestamp).toLocaleString(undefined, {
        timeZone,
        timeZoneName: "short",
      })}
      )
    </>
  );
}

function NowDisplay() {
  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>Now Demo</h1>

      <NowAtomDisplay />
      <NowEverySecondDisplay />
      <NowEveryMinuteDisplay />
      <NowEveryUtcHourDisplay />
      <NowEveryLocalHourDisplay />
      <NowEveryUtcDayDisplay />
      <NowEveryLocalDayDisplay />
      <NowEveryZonedDisplay />

      <div style={{ marginTop: "30px", fontSize: "12px", color: "#666" }}>
        <p>• nowAtom updates on every requestAnimationFrame (smooth)</p>
        <p>• nowEverySecondAtom updates every second (1000ms)</p>
        <p>• nowEveryMinuteAtom updates every minute (60000ms)</p>
        <p>• nowEveryUtcHourAtom updates every UTC hour (3600000ms)</p>
        <p>• nowEveryLocalHourAtom updates every local hour</p>
        <p>• nowEveryUtcDayAtom updates every UTC day (86400000ms)</p>
        <p>• nowEveryLocalDayAtom updates every local day</p>
        <p>• zoned now updates every selected time zone hour/day</p>
        <p style={{ marginTop: "10px", fontWeight: "bold", color: "#ff6b6b" }}>
          🔴 Red badges show render count for each component
        </p>
      </div>
    </div>
  );
}

function App() {
  return <NowDisplay />;
}

export default App;
