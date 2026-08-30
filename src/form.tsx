import type { StandardSchemaV1 } from "@standard-schema/spec";
import {
  type Atom,
  type PrimitiveAtom,
  type WritableAtom,
  atom,
  useAtomValue,
  useSetAtom,
} from "jotai";
import type { Store } from "jotai/vanilla/store";
import type {
  ChangeEvent,
  FocusEventHandler,
  FormEvent,
  FormHTMLAttributes,
  ReactElement,
  ReactNode,
} from "react";

export type FormSchema = StandardSchemaV1;
export type SchemaInput<TSchema extends FormSchema> =
  StandardSchemaV1.InferInput<TSchema>;
export type SchemaOutput<TSchema extends FormSchema> =
  StandardSchemaV1.InferOutput<TSchema>;

export type DeepPartial<TValue> = TValue extends Date | File | FileList
  ? TValue
  : TValue extends readonly (infer TItem)[]
    ? DeepPartial<TItem>[]
    : TValue extends object
      ? { [TKey in keyof TValue]?: DeepPartial<TValue[TKey]> }
      : TValue;

export type PathKey = string | number;
export type Path = readonly PathKey[];
export type RequiredPath = readonly [PathKey, ...Path];

type FieldPathAtDepth<TValue, TDepth extends 0[]> = TDepth["length"] extends 6
  ? RequiredPath
  : NonNullable<TValue> extends readonly (infer TItem)[]
    ?
        | readonly [number]
        | readonly [number, ...FieldPathAtDepth<TItem, [...TDepth, 0]>]
    : NonNullable<TValue> extends object
      ? {
          [TKey in keyof NonNullable<TValue> & PathKey]:
            | readonly [TKey]
            | (FieldPathAtDepth<
                NonNullable<TValue>[TKey],
                [...TDepth, 0]
              > extends infer TRest extends RequiredPath
                ? readonly [TKey, ...TRest]
                : never);
        }[keyof NonNullable<TValue> & PathKey]
      : never;

export type FieldPath<TValue> = FieldPathAtDepth<TValue, []>;

export type PathValue<TValue, TPath extends Path> = TPath extends readonly [
  infer TKey,
  ...infer TRest extends Path,
]
  ? TKey extends keyof NonNullable<TValue>
    ? PathValue<NonNullable<TValue>[TKey], TRest>
    : TKey extends number
      ? NonNullable<TValue> extends readonly (infer TItem)[]
        ? PathValue<TItem, TRest>
        : unknown
      : unknown
  : TValue;

export type ValidationMode =
  | "initial"
  | "touch"
  | "input"
  | "change"
  | "blur"
  | "submit";

export interface FormIssue {
  readonly message: string;
  readonly path: Path;
  readonly cause?: unknown;
}

export interface CreateFormConfig<TSchema extends FormSchema> {
  readonly store: Store;
  readonly schema: TSchema;
  readonly initialInput?: DeepPartial<SchemaInput<TSchema>> | undefined;
  readonly validate?: ValidationMode | undefined;
  readonly revalidate?: Exclude<ValidationMode, "initial"> | undefined;
}

export interface FieldMeta {
  readonly path: Path;
  readonly touched: boolean;
  readonly edited: boolean;
}

export interface FormInternal<TSchema extends FormSchema = FormSchema> {
  readonly store: Store;
  readonly schema: TSchema;
  readonly validateMode: ValidationMode;
  readonly revalidateMode: Exclude<ValidationMode, "initial">;
  readonly baselineInputAtom: PrimitiveAtom<
    DeepPartial<SchemaInput<TSchema>> | undefined
  >;
  readonly metaAtom: PrimitiveAtom<readonly FieldMeta[]>;
  readonly validatedAtom: PrimitiveAtom<boolean>;
  readonly fields: Map<string, FieldStore<TSchema, RequiredPath>>;
  validationId: number;
}

export interface Form<TSchema extends FormSchema = FormSchema> {
  readonly internal: FormInternal<TSchema>;

  readonly inputAtom: PrimitiveAtom<
    DeepPartial<SchemaInput<TSchema>> | undefined
  >;
  readonly outputAtom: PrimitiveAtom<SchemaOutput<TSchema> | undefined>;
  readonly issuesAtom: PrimitiveAtom<readonly FormIssue[]>;

  readonly submittingAtom: PrimitiveAtom<boolean>;
  readonly submittedAtom: PrimitiveAtom<boolean>;
  readonly validatingAtom: PrimitiveAtom<boolean>;

  readonly touchedAtom: Atom<boolean>;
  readonly editedAtom: Atom<boolean>;
  readonly dirtyAtom: Atom<boolean>;
  readonly validAtom: Atom<boolean>;
}

export interface FieldStore<
  TSchema extends FormSchema = FormSchema,
  TPath extends RequiredPath = RequiredPath,
> {
  readonly path: TPath;
  readonly inputAtom: WritableAtom<
    DeepPartial<PathValue<SchemaInput<TSchema>, TPath>> | undefined,
    [DeepPartial<PathValue<SchemaInput<TSchema>, TPath>> | undefined],
    void
  >;
  readonly issuesAtom: Atom<readonly FormIssue[]>;
  readonly touchedAtom: Atom<boolean>;
  readonly editedAtom: Atom<boolean>;
  readonly dirtyAtom: Atom<boolean>;
  readonly validAtom: Atom<boolean>;
}

export type ValidationResult<TSchema extends FormSchema> =
  | {
      readonly success: true;
      readonly output: SchemaOutput<TSchema>;
    }
  | {
      readonly success: false;
      readonly issues: readonly FormIssue[];
    };

export type SubmitHandler<TSchema extends FormSchema, TEvent = undefined> = (
  output: SchemaOutput<TSchema>,
  event: TEvent,
) => unknown | Promise<unknown>;

export function createForm<TSchema extends FormSchema>({
  store,
  schema,
  initialInput,
  validate: validateMode = "submit",
  revalidate: revalidateMode = "input",
}: CreateFormConfig<TSchema>): Form<TSchema> {
  const inputAtom = atom(initialInput);
  const baselineInputAtom = atom(initialInput);
  const outputAtom = atom<SchemaOutput<TSchema> | undefined>(undefined);
  const issuesAtom = atom<readonly FormIssue[]>([]);
  const submittingAtom = atom(false);
  const submittedAtom = atom(false);
  const validatingAtom = atom(false);
  const metaAtom = atom<readonly FieldMeta[]>([]);
  const validatedAtom = atom(false);

  const touchedAtom = atom((get) =>
    get(metaAtom).some((field) => field.touched),
  );
  const editedAtom = atom((get) => get(metaAtom).some((field) => field.edited));
  const dirtyAtom = atom(
    (get) => !isEqual(get(inputAtom), get(baselineInputAtom)),
  );
  const validAtom = atom((get) => get(issuesAtom).length === 0);

  const form: Form<TSchema> = {
    internal: {
      store,
      schema,
      validateMode,
      revalidateMode,
      baselineInputAtom,
      metaAtom,
      validatedAtom,
      fields: new Map(),
      validationId: 0,
    },
    inputAtom,
    outputAtom,
    issuesAtom,
    submittingAtom,
    submittedAtom,
    validatingAtom,
    touchedAtom,
    editedAtom,
    dirtyAtom,
    validAtom,
  };

  if (validateMode === "initial") void validate(form);
  return form;
}

export function getField<
  TSchema extends FormSchema,
  const TPath extends FieldPath<SchemaInput<TSchema>>,
>(form: Form<TSchema>, path: TPath): FieldStore<TSchema, TPath> {
  const { internal } = form;
  const key = getPathKey(path);
  const cached = internal.fields.get(key);
  if (cached) return cached as FieldStore<TSchema, TPath>;

  const inputAtom = atom(
    (get) =>
      getPathValue(get(form.inputAtom), path) as
        | DeepPartial<PathValue<SchemaInput<TSchema>, TPath>>
        | undefined,
    (_get, set, value) => {
      ++internal.validationId;
      set(
        form.inputAtom,
        setPathValue(internal.store.get(form.inputAtom), path, value) as
          | DeepPartial<SchemaInput<TSchema>>
          | undefined,
      );
      set(form.outputAtom, undefined);
      set(form.validatingAtom, false);
      setFieldMeta(form, path, { edited: true });
    },
  );
  const issuesAtom = atom((get) =>
    get(form.issuesAtom).filter((issue) => isSamePath(issue.path, path)),
  );
  const touchedAtom = atom(
    (get) => getFieldMeta(get(internal.metaAtom), path)?.touched ?? false,
  );
  const editedAtom = atom(
    (get) => getFieldMeta(get(internal.metaAtom), path)?.edited ?? false,
  );
  const dirtyAtom = atom(
    (get) =>
      !isEqual(
        getPathValue(get(form.inputAtom), path),
        getPathValue(get(internal.baselineInputAtom), path),
      ),
  );
  const validAtom = atom(
    (get) =>
      !get(form.issuesAtom).some((issue) => isPathPrefix(path, issue.path)),
  );

  const field: FieldStore<TSchema, TPath> = {
    path,
    inputAtom,
    issuesAtom,
    touchedAtom,
    editedAtom,
    dirtyAtom,
    validAtom,
  };
  internal.fields.set(key, field as FieldStore<TSchema, RequiredPath>);
  return field;
}

export function getInput<TSchema extends FormSchema>(
  form: Form<TSchema>,
): DeepPartial<SchemaInput<TSchema>> | undefined;
export function getInput<
  TSchema extends FormSchema,
  const TPath extends FieldPath<SchemaInput<TSchema>>,
>(
  form: Form<TSchema>,
  path: TPath,
): DeepPartial<PathValue<SchemaInput<TSchema>, TPath>> | undefined;
export function getInput(form: Form, path?: RequiredPath): unknown {
  const input = form.internal.store.get(form.inputAtom);
  return path ? getPathValue(input, path) : input;
}

export function setInput<
  TSchema extends FormSchema,
  const TPath extends FieldPath<SchemaInput<TSchema>>,
>(
  form: Form<TSchema>,
  path: TPath,
  input: DeepPartial<PathValue<SchemaInput<TSchema>, TPath>> | undefined,
): void {
  form.internal.store.set(getField(form, path).inputAtom, input);
  void validateIfRequired(form, "input");
}

export function setIssues<TSchema extends FormSchema>(
  form: Form<TSchema>,
  issues: readonly FormIssue[],
): void {
  const { internal } = form;
  ++internal.validationId;
  internal.store.set(form.issuesAtom, issues);
  internal.store.set(form.outputAtom, undefined);
  internal.store.set(internal.validatedAtom, true);
  internal.store.set(form.validatingAtom, false);
}

export async function validate<TSchema extends FormSchema>(
  form: Form<TSchema>,
): Promise<ValidationResult<TSchema>> {
  const { internal } = form;
  const validationId = ++internal.validationId;
  internal.store.set(form.validatingAtom, true);

  try {
    const result = await internal.schema["~standard"].validate(
      internal.store.get(form.inputAtom),
    );
    const issues = result.issues?.map(normalizeIssue) ?? [];

    if (validationId !== internal.validationId) {
      return {
        success: false,
        issues: internal.store.get(form.issuesAtom),
      };
    }

    internal.store.set(internal.validatedAtom, true);
    internal.store.set(form.issuesAtom, issues);

    if (result.issues) {
      internal.store.set(form.outputAtom, undefined);
      return { success: false, issues };
    }

    internal.store.set(form.outputAtom, result.value);
    return { success: true, output: result.value };
  } finally {
    if (validationId === internal.validationId) {
      internal.store.set(form.validatingAtom, false);
    }
  }
}

export async function submit<TSchema extends FormSchema, TEvent = undefined>(
  form: Form<TSchema>,
  handler: SubmitHandler<TSchema, TEvent>,
  event: TEvent = undefined as TEvent,
): Promise<boolean> {
  const { store } = form.internal;
  if (store.get(form.submittingAtom)) return false;

  store.set(form.submittedAtom, true);
  const result = await validate(form);
  if (!result.success) return false;

  store.set(form.submittingAtom, true);
  try {
    await handler(result.output, event);
    return true;
  } finally {
    store.set(form.submittingAtom, false);
  }
}

export function handleSubmit<
  TSchema extends FormSchema,
  TEvent extends { preventDefault(): void },
>(
  form: Form<TSchema>,
  handler: SubmitHandler<TSchema, TEvent>,
): (event: TEvent) => Promise<boolean> {
  return (event) => {
    event.preventDefault();
    return submit(form, handler, event);
  };
}

export function reset<TSchema extends FormSchema>(
  form: Form<TSchema>,
  input?: DeepPartial<SchemaInput<TSchema>> | undefined,
): void {
  const { internal } = form;
  const hasNewInitialInput = arguments.length > 1;
  const nextInput = hasNewInitialInput
    ? input
    : internal.store.get(internal.baselineInputAtom);
  ++internal.validationId;
  if (hasNewInitialInput) {
    internal.store.set(internal.baselineInputAtom, input);
  }
  internal.store.set(form.inputAtom, nextInput);
  internal.store.set(form.outputAtom, undefined);
  internal.store.set(form.issuesAtom, []);
  internal.store.set(form.submittingAtom, false);
  internal.store.set(form.submittedAtom, false);
  internal.store.set(form.validatingAtom, false);
  internal.store.set(internal.metaAtom, []);
  internal.store.set(internal.validatedAtom, false);
}

export type FormProps<TSchema extends FormSchema> = Omit<
  FormHTMLAttributes<HTMLFormElement>,
  "noValidate" | "onSubmit"
> & {
  readonly of: Form<TSchema>;
  readonly onSubmit: SubmitHandler<TSchema, FormEvent<HTMLFormElement>>;
};

export function Form<TSchema extends FormSchema>({
  of,
  onSubmit,
  ...props
}: FormProps<TSchema>): ReactElement {
  return <form {...props} noValidate onSubmit={handleSubmit(of, onSubmit)} />;
}

type FormControlElement =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement;

export interface FieldElementProps {
  readonly name: string;
  readonly onFocus: FocusEventHandler<FormControlElement>;
  readonly onChange: (event: ChangeEvent<FormControlElement>) => void;
  readonly onBlur: FocusEventHandler<FormControlElement>;
}

export interface FieldRenderState<TValue> {
  readonly input: TValue | undefined;
  readonly issues: readonly FormIssue[];
  readonly touched: boolean;
  readonly edited: boolean;
  readonly dirty: boolean;
  readonly valid: boolean;
  readonly setInput: (input: TValue | undefined) => void;
  readonly props: FieldElementProps;
}

export interface FieldProps<
  TSchema extends FormSchema,
  TPath extends FieldPath<SchemaInput<TSchema>>,
> {
  readonly of: Form<TSchema>;
  readonly path: TPath;
  readonly children: (
    field: FieldRenderState<
      DeepPartial<PathValue<SchemaInput<TSchema>, TPath>>
    >,
  ) => ReactNode;
}

export function Field<
  TSchema extends FormSchema,
  const TPath extends FieldPath<SchemaInput<TSchema>>,
>({ of: form, path, children }: FieldProps<TSchema, TPath>): ReactNode {
  const { store } = form.internal;
  const field = getField(form, path);
  const input = useAtomValue(field.inputAtom, { store });
  const issues = useAtomValue(field.issuesAtom, { store });
  const touched = useAtomValue(field.touchedAtom, { store });
  const edited = useAtomValue(field.editedAtom, { store });
  const dirty = useAtomValue(field.dirtyAtom, { store });
  const valid = useAtomValue(field.validAtom, { store });
  const setFieldInput = useSetAtom(field.inputAtom, { store });

  return children({
    input,
    issues,
    touched,
    edited,
    dirty,
    valid,
    setInput(value) {
      setFieldInput(value);
      void validateIfRequired(form, "input");
    },
    props: {
      name: getFieldName(path),
      onFocus() {
        setFieldMeta(form, path, { touched: true });
        void validateIfRequired(form, "touch");
      },
      onChange(event) {
        setFieldInput(getElementInput(event.currentTarget) as never);
        void validateIfRequired(form, "input");
        void validateIfRequired(form, "change");
      },
      onBlur() {
        void validateIfRequired(form, "blur");
      },
    },
  });
}

async function validateIfRequired<TSchema extends FormSchema>(
  form: Form<TSchema>,
  mode: Exclude<ValidationMode, "initial" | "submit">,
): Promise<void> {
  const { internal } = form;
  const validationMode = internal.store.get(internal.validatedAtom)
    ? internal.revalidateMode
    : internal.validateMode;
  if (validationMode === mode) await validate(form);
}

function setFieldMeta<TSchema extends FormSchema>(
  form: Form<TSchema>,
  path: Path,
  patch: Partial<Pick<FieldMeta, "touched" | "edited">>,
): void {
  const { internal } = form;
  const fields = internal.store.get(internal.metaAtom);
  const index = fields.findIndex((field) => isSamePath(field.path, path));
  const previous = fields[index] ?? {
    path: [...path],
    touched: false,
    edited: false,
  };
  const next = { ...previous, ...patch };
  internal.store.set(
    internal.metaAtom,
    index < 0
      ? [...fields, next]
      : fields.map((field, fieldIndex) =>
          fieldIndex === index ? next : field,
        ),
  );
}

function getFieldMeta(
  fields: readonly FieldMeta[],
  path: Path,
): FieldMeta | undefined {
  return fields.find((field) => isSamePath(field.path, path));
}

function normalizeIssue(issue: StandardSchemaV1.Issue): FormIssue {
  return {
    message: issue.message,
    path:
      issue.path?.flatMap((segment) => {
        const key = typeof segment === "object" ? segment.key : segment;
        return typeof key === "string" || typeof key === "number" ? [key] : [];
      }) ?? [],
    cause: issue,
  };
}

function getPathValue(value: unknown, path: Path): unknown {
  let current = value;
  for (const key of path) {
    if (current == null || typeof current !== "object") return;
    current = (current as Record<PathKey, unknown>)[key];
  }
  return current;
}

function setPathValue(
  input: unknown,
  path: RequiredPath,
  value: unknown,
): unknown {
  const [key, ...rest] = path;
  const container = Array.isArray(input)
    ? [...input]
    : input != null && typeof input === "object"
      ? { ...input }
      : typeof key === "number"
        ? []
        : {};

  if (rest.length === 0) {
    (container as Record<PathKey, unknown>)[key] = value;
  } else {
    const previous = (container as Record<PathKey, unknown>)[key];
    (container as Record<PathKey, unknown>)[key] = setPathValue(
      previous,
      rest as unknown as RequiredPath,
      value,
    );
  }
  return container;
}

function getElementInput(element: FormControlElement): unknown {
  if (element instanceof HTMLInputElement) {
    if (element.type === "checkbox") return element.checked;
    if (element.type === "file") return element.files;
    if (element.type === "number" || element.type === "range") {
      return Number.isNaN(element.valueAsNumber)
        ? undefined
        : element.valueAsNumber;
    }
  }
  if (element instanceof HTMLSelectElement && element.multiple) {
    return Array.from(element.selectedOptions, (option) => option.value);
  }
  return element.value;
}

function getFieldName(path: Path): string {
  return path.reduce<string>(
    (name, key, index) =>
      typeof key === "number"
        ? `${name}[${key}]`
        : index === 0
          ? key
          : `${name}.${key}`,
    "",
  );
}

function getPathKey(path: Path): string {
  return JSON.stringify(path);
}

function isSamePath(left: Path, right: Path): boolean {
  return (
    left.length === right.length &&
    left.every((key, index) => key === right[index])
  );
}

function isPathPrefix(prefix: Path, path: Path): boolean {
  return (
    prefix.length <= path.length &&
    prefix.every((key, index) => key === path[index])
  );
}

function isEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true;
  if (left instanceof Date && right instanceof Date) {
    return left.getTime() === right.getTime();
  }
  if (Array.isArray(left) && Array.isArray(right)) {
    return (
      left.length === right.length &&
      left.every((value, index) => isEqual(value, right[index]))
    );
  }
  if (
    left != null &&
    right != null &&
    typeof left === "object" &&
    typeof right === "object"
  ) {
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    return (
      leftKeys.length === rightKeys.length &&
      leftKeys.every(
        (key) =>
          Object.prototype.hasOwnProperty.call(right, key) &&
          isEqual(
            (left as Record<string, unknown>)[key],
            (right as Record<string, unknown>)[key],
          ),
      )
    );
  }
  return false;
}
