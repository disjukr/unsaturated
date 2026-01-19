import { useBunja } from "bunja/react";
import { useAtomValue } from "jotai";
import { useRef } from "react";
import { nowBunja } from "unsaturated/time";

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

function NowEveryHourDisplay() {
  const { nowEveryHourAtom } = useBunja(nowBunja);
  const nowEveryHour = useAtomValue(nowEveryHourAtom);
  const formatDateTime = (timestamp: number) =>
    new Date(timestamp).toLocaleString();

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>
        Every Hour
        <RenderCounter />
      </h2>
      <div
        style={{
          padding: "10px",
          backgroundColor: "#ffe6f0",
          borderRadius: "5px",
        }}
      >
        <strong>nowEveryHourAtom:</strong> {nowEveryHour}ms (
        {formatDateTime(nowEveryHour)})
      </div>
    </div>
  );
}

function NowEveryDayDisplay() {
  const { nowEveryDayAtom } = useBunja(nowBunja);
  const nowEveryDay = useAtomValue(nowEveryDayAtom);
  const formatDateTime = (timestamp: number) =>
    new Date(timestamp).toLocaleString();

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>
        Every Day
        <RenderCounter />
      </h2>
      <div
        style={{
          padding: "10px",
          backgroundColor: "#f0e6ff",
          borderRadius: "5px",
        }}
      >
        <strong>nowEveryDayAtom:</strong> {nowEveryDay}ms (
        {formatDateTime(nowEveryDay)})
      </div>
    </div>
  );
}

function TimeDisplay() {
  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>Time Demo (nowBunja)</h1>

      <NowAtomDisplay />
      <NowEverySecondDisplay />
      <NowEveryMinuteDisplay />
      <NowEveryHourDisplay />
      <NowEveryDayDisplay />

      <div style={{ marginTop: "30px", fontSize: "12px", color: "#666" }}>
        <p>• nowAtom updates on every requestAnimationFrame (smooth)</p>
        <p>• nowEverySecondAtom updates every second (1000ms)</p>
        <p>• nowEveryMinuteAtom updates every minute (60000ms)</p>
        <p>• nowEveryHourAtom updates every hour (3600000ms)</p>
        <p>• nowEveryDayAtom updates every day (86400000ms)</p>
        <p style={{ marginTop: "10px", fontWeight: "bold", color: "#ff6b6b" }}>
          🔴 Red badges show render count for each component
        </p>
      </div>
    </div>
  );
}

function App() {
  return <TimeDisplay />;
}

export default App;
