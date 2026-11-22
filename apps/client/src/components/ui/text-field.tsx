import { type ComponentProps, useId } from "react";

type TextFieldProps = ComponentProps<"input"> & {
  label: string;
  hideLabel?: boolean;
  containerClassName?: string;
};

export function TextField({
  label,
  hideLabel = false,
  containerClassName = "",
  className = "",
  id,
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${containerClassName}`}>
      <label
        htmlFor={inputId}
        className={
          hideLabel ? "sr-only" : "text-xs leading-4.5 font-semibold text-ink"
        }
      >
        {label}
      </label>
      <input
        {...props}
        id={inputId}
        className={`h-13 w-full min-w-0 rounded-[10px] border border-outline bg-white px-4 text-sm leading-normal text-ink placeholder:text-muted focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${className}`}
      />
    </div>
  );
}
