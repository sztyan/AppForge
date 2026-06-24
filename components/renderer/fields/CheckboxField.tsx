import { FieldProps } from "@/lib/types";

export default function CheckboxField({ field, register, errors }: FieldProps) {
  const error = errors?.[field.name];
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-start gap-3">
        <input
          id={field.name}
          type="checkbox"
          aria-invalid={!!error}
          className="mt-0.5 h-4 w-4 rounded border-input accent-primary cursor-pointer"
          {...register(field.name, {
            required: field.required ? `${field.label} must be checked` : false,
          })}
        />
        <div className="flex flex-col gap-0.5">
          <label
            htmlFor={field.name}
            className="text-sm font-medium text-foreground cursor-pointer leading-tight"
          >
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </label>
          {field.helpText && !error && (
            <p className="text-xs text-muted-foreground">{field.helpText}</p>
          )}
        </div>
      </div>
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}
