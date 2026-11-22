import type { ReactNode } from "react";
import { AppHeader } from "./app-header";

export function PageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />
      <main className="flex-1 bg-workspace p-4 sm:p-8">{children}</main>
    </div>
  );
}
