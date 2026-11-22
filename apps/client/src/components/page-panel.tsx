import type { ReactNode } from "react";

type PagePanelProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function PagePanel({ title, description, children }: PagePanelProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-outline bg-white">
      <div className="flex flex-col gap-1.5 bg-panel-header px-4 py-5 sm:px-6">
        <p className="text-lg leading-normal font-semibold wrap-anywhere">
          {title}
        </p>
        <p className="text-[13px] leading-normal text-muted">{description}</p>
      </div>
      <div className="flex min-w-0 flex-col gap-6 p-4 sm:p-8">{children}</div>
    </div>
  );
}
