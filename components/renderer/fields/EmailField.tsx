import { FieldProps } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function EmailField({ field, register, errors }: FieldProps) {
  const error = errors?.[field.name];
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={field.name} className="text-sm font-medium text-foreground">
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </label>
      <input
        id={field.name}
        type="email"
        placeholder={field.placeholder ?? `you@example.com`}
        aria-invalid={!!error}
        className={cn(
          "flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm shadow-xs",
          "transition-colors placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring",
          error ? "border-destructive ring-2 ring-destructive/20" : "border-input"
        )}
        {...register(field.name, {
          required: field.required ? `${field.label} is required` : false,
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Please enter a valid email address",
          },
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
