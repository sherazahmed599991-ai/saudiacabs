const fieldClass =
  "w-full rounded-md border border-border px-3 py-2.5 text-sm outline-none focus:border-primary";

type BaseProps = {
  label: string;
  name: string;
  required?: boolean;
};

export function TextField({
  label,
  name,
  defaultValue,
  type = "text",
  step,
  required,
}: BaseProps & { defaultValue?: string; type?: string; step?: string }) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        step={step}
        defaultValue={defaultValue}
        required={required}
        className={fieldClass}
      />
    </div>
  );
}

export function TextAreaField({
  label,
  name,
  defaultValue,
  rows = 3,
  required,
}: BaseProps & { defaultValue?: string; rows?: number }) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </label>
      <textarea id={name} name={name} defaultValue={defaultValue} rows={rows} required={required} className={fieldClass} />
    </div>
  );
}
