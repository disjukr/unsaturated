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
    <main className="login-example">
      <Form
        of={form}
        className="login-form"
        onSubmit={(output) => console.log(output)}
      >
        <h1>Login form</h1>

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

        <div className="form-actions">
          <button type="submit" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit"}
          </button>
          <button type="button" onClick={() => reset(form)}>
            Reset
          </button>
        </div>
      </Form>

      <aside className="form-state">
        <h2>Form state</h2>
        <dl>
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
    <div className="form-field">
      <label htmlFor={name}>
        {label} {required && "*"}
      </label>
      <input
        {...props}
        id={name}
        name={name}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <p className="form-error" id={errorId}>
          {error.message}
        </p>
      )}
    </div>
  );
}

function State({ label, value }: { label: string; value: boolean }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{String(value)}</dd>
    </div>
  );
}
