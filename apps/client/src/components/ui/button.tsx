import type { ComponentProps } from "react";

export function Button({
  className = "",
  type = "button",
  ...props
}: ComponentProps<"button">) {
  return (
    <button
      {...props}
      type={type}
      className={`inline-flex h-13 shrink-0 items-center justify-center rounded-[10px] bg-primary px-5 text-sm leading-normal font-semibold whitespace-nowrap text-white outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 aria-disabled:cursor-default ${className}`}
    />
  );
}
