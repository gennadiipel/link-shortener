import type { ComponentProps } from "react";

type ButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "secondary";
};

export function Button({
  className = "",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={`inline-flex h-13 shrink-0 items-center justify-center rounded-[10px] px-5 text-sm leading-normal font-semibold whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 aria-disabled:cursor-default ${variant === "secondary" ? "border border-outline bg-white text-ink" : "bg-primary text-white"} ${className}`}
    />
  );
}
