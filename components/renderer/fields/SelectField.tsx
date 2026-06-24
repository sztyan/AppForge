import { FieldProps } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function SelectField({ field, register, errors }: FieldProps) {
  const error = errors?.[field.name];
  const options = field.options ?? [];

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={field.name} className="text-sm font-medium text-foreground">
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </label>
      <select
        id={field.name}
        aria-invalid={!!error}
        className={cn(
          "flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm shadow-xs",
          "transition-colors text-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring",
          error ? "border-destructive ring-2 ring-destructive/20" : "border-input"
        )}
        {...register(field.name, {
          required: field.required ? `${field.label} is required` : false,
          validate: field.required
            ? (v: string) => v !== "" || `${field.label} is required`
            : undefined,
        })}
        defaultValue=""
      >
        <option value="" disabled>
          Select {field.label}…
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {options.length === 0 && (
        <p className="text-xs text-amber-500">
          No options defined. Add an <code className="font-mono">options</code> array to this field.
        </p>
      )}
      {field.helpText && !error && (
        <p className="text-xs text-muted-foreground">{field.helpText}</p>
      )}
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}
