import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: ExampleIndex,
});

function ExampleIndex() {
  return (
    <main className="mx-auto w-[min(56rem,calc(100%-3rem))] py-16 sm:py-24">
      <div className="mb-10">
        <p className="mb-3 mt-0 text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
          Playground
        </p>
        <h1 className="m-0 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
          Examples
        </h1>
      </div>
      <ul className="m-0 grid list-none gap-5 p-0 sm:grid-cols-2">
        <li>
          <Link
            className="group flex min-h-44 flex-col rounded-3xl border border-white/80 bg-white/85 p-7 text-inherit no-underline shadow-[0_20px_50px_-30px_rgba(30,41,59,0.45)] transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_24px_60px_-28px_rgba(79,70,229,0.4)]"
            to="/form"
          >
            <span className="mb-8 grid h-11 w-11 place-items-center rounded-2xl bg-indigo-50 text-lg font-black text-indigo-600 ring-1 ring-indigo-100">
              F
            </span>
            <strong className="text-xl tracking-tight text-slate-900">
              Form
            </strong>
            <span className="mt-2 text-sm leading-6 text-slate-500">
              Zod login form with validation and state tracking
            </span>
            <span className="mt-auto pt-6 text-sm font-bold text-indigo-600 transition-transform group-hover:translate-x-1">
              Open example →
            </span>
          </Link>
        </li>
        <li>
          <Link
            className="group flex min-h-44 flex-col rounded-3xl border border-white/80 bg-white/85 p-7 text-inherit no-underline shadow-[0_20px_50px_-30px_rgba(30,41,59,0.45)] transition-all duration-200 hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_24px_60px_-28px_rgba(14,165,233,0.35)]"
            to="/now"
          >
            <span className="mb-8 grid h-11 w-11 place-items-center rounded-2xl bg-sky-50 text-lg font-black text-sky-600 ring-1 ring-sky-100">
              N
            </span>
            <strong className="text-xl tracking-tight text-slate-900">
              Now
            </strong>
            <span className="mt-2 text-sm leading-6 text-slate-500">
              Time atoms with intervals and time zones
            </span>
            <span className="mt-auto pt-6 text-sm font-bold text-sky-600 transition-transform group-hover:translate-x-1">
              Open example →
            </span>
          </Link>
        </li>
      </ul>
    </main>
  );
}
