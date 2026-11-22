import type { ComponentProps } from "react";

export function HelperText({ children, ...props }: ComponentProps<"p">) {
  return (
    <p
      {...props}
      className="flex items-start gap-2.5 text-[13px] leading-normal text-muted"
    >
      <span
        aria-hidden="true"
        className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
      />
      <span className="min-w-0">{children}</span>
    </p>
  );
}
