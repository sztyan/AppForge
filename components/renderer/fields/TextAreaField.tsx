import { FieldProps } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function TextAreaField({ field, register, errors }: FieldProps) {
  const error = errors?.[field.name];
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={field.name} className="text-sm font-medium text-foreground">
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </label>
      <textarea
        id={field.name}
        rows={4}
        placeholder={field.placeholder ?? `Enter ${field.label}`}
        aria-invalid={!!error}
        className={cn(
          "flex w-full rounded-md border bg-background px-3 py-2 text-sm shadow-xs",
          "transition-colors placeholder:text-muted-foreground resize-y",
          "focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring",
          error ? "border-destructive ring-2 ring-destructive/20" : "border-input"
        )}
        {...register(field.name, {
          required: field.required ? `${field.label} is required` : false,
        })}
      />
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
