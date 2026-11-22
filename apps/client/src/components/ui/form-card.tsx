import { type ReactNode, useId } from "react";

type FormCardProps = {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
};

export function FormCard({
  title,
  description,
  children,
  className = "",
}: FormCardProps) {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className={`flex min-w-0 flex-col rounded-xl border border-outline bg-white p-4 sm:p-6 ${className}`}
    >
      <div className="flex flex-col gap-1">
        <h2 id={headingId} className="text-base leading-normal font-semibold">
          {title}
        </h2>
        <p className="text-[13px] leading-normal text-muted">{description}</p>
      </div>
      {children}
    </section>
  );
}
