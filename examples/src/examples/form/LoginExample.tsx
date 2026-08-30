import { bunja } from "bunja";
import { useBunja } from "bunja/react";
import { useAtomValue } from "jotai";
import { type InputHTMLAttributes } from "react";
import {
  Field,
  Form,
  type FormIssue,
  createForm,
  reset,
} from "unsaturated/form";
import { JotaiStoreScope } from "unsaturated/store";
import * as z from "zod";

const LoginSchema = z.object({
  email: z.email("The email address is badly formatted."),
  password: z
    .string()
    .min(1, "Please enter your password.")
    .min(4, "Your password must have 4 characters or more."),
});

const loginFormBunja = bunja(() => {
  const store = bunja.use(JotaiStoreScope);

  return createForm({
    store,
    schema: LoginSchema,
    initialInput: { email: "", password: "" },
  });
});

export function LoginExample() {
  const form = useBunja(loginFormBunja);
  const submitting = useAtomValue(form.submittingAtom);
  const submitted = useAtomValue(form.submittedAtom);
  const dirty = useAtomValue(form.dirtyAtom);
  const touched = useAtomValue(form.touchedAtom);
  const valid = useAtomValue(form.validAtom);

  return (
    <main className="mx-auto grid w-[min(64rem,calc(100%-3rem))] grid-cols-[minmax(0,1fr)_17rem] items-start gap-6 py-12 sm:py-20 max-md:grid-cols-1">
      <section className="overflow-hidden rounded-3xl border border-white/80 bg-white/90 shadow-[0_24px_70px_-36px_rgba(30,41,59,0.55)]">
        <div className="border-b border-slate-100 px-7 py-8 sm:px-10">
          <span className="mb-5 grid h-11 w-11 place-items-center rounded-2xl bg-indigo-600 text-lg font-black text-white shadow-lg shadow-indigo-200">
            U
          </span>
          <p className="mb-2 mt-0 text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
            Welcome back
          </p>
          <h1 className="m-0 text-3xl font-black tracking-tight text-slate-950">
            Sign in to your account
          </h1>
          <p className="mb-0 mt-3 text-sm leading-6 text-slate-500">
            This example validates your input with Zod before submitting.
          </p>
        </div>

        <Form
          of={form}
          className="grid gap-6 px-7 py-8 sm:px-10"
          onSubmit={(output) => console.log(output)}
        >
          <Field of={form} path={["email"]}>
            {(field) => (
              <TextField
                {...field.props}
                value={field.input ?? ""}
                issues={field.issues}
                type="email"
                label="Email"
                placeholder="example@email.com"
                autoComplete="email"
                required
              />
            )}
          </Field>

          <Field of={form} path={["password"]}>
            {(field) => (
              <TextField
                {...field.props}
                value={field.input ?? ""}
                issues={field.issues}
                type="password"
                label="Password"
                placeholder="****"
                autoComplete="current-password"
                required
              />
            )}
          </Field>

          <div className="grid grid-cols-[1fr_auto] gap-3 pt-1">
            <button
              className="cursor-pointer rounded-xl border border-indigo-600 bg-indigo-600 px-5 py-3 font-bold text-white shadow-lg shadow-indigo-200 transition hover:border-indigo-700 hover:bg-indigo-700 focus:outline-none focus:ring-3 focus:ring-indigo-200 disabled:cursor-wait disabled:opacity-60"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Submitting…" : "Submit"}
            </button>
            <button
              className="cursor-pointer rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-3 focus:ring-slate-200"
              type="button"
              onClick={() => reset(form)}
            >
              Reset
            </button>
          </div>
        </Form>
      </section>

      <aside className="self-start overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-[0_24px_60px_-32px_rgba(15,23,42,0.75)]">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="mb-1 mt-0 text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-indigo-300">
              Live
            </p>
            <h2 className="m-0 text-lg tracking-tight">Form state</h2>
          </div>
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
        </div>
        <dl className="m-0 grid gap-2">
          <State label="Submitted" value={submitted} />
          <State label="Dirty" value={dirty} />
          <State label="Touched" value={touched} />
          <State label="Valid" value={valid} />
        </dl>
      </aside>
    </main>
  );
}

interface TextFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "name"
> {
  name: string;
  label: string;
  issues: readonly FormIssue[];
}

function TextField({
  name,
  label,
  issues,
  required,
  ...props
}: TextFieldProps) {
  const error = issues[0];
  const errorId = `${name}-error`;

  return (
    <div className="grid gap-2.5">
      <label className="text-sm font-bold text-slate-700" htmlFor={name}>
        {label}
        {required && <span className="ml-1 text-indigo-500">*</span>}
      </label>
      <input
        {...props}
        id={name}
        name={name}
        className={`box-border w-full rounded-xl border bg-slate-50/70 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-3 ${error ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100" : "border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"}`}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <p
          className="m-0 flex items-center gap-1.5 text-sm font-medium text-rose-600"
          id={errorId}
        >
          <span aria-hidden="true">●</span>
          {error.message}
        </p>
      )}
    </div>
  );
}

function State({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white/6 px-3.5 py-3 ring-1 ring-white/8">
      <dt className="text-sm text-slate-400">{label}</dt>
      <dd
        className={`m-0 rounded-full px-2.5 py-1 font-mono text-[0.6875rem] font-bold uppercase tracking-wider ${value ? "bg-emerald-400/15 text-emerald-300" : "bg-slate-700/70 text-slate-300"}`}
      >
        {String(value)}
      </dd>
    </div>
  );
}
