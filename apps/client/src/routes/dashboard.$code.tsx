import {
  formatManagerCode,
  isLinkCode,
  normalizeManagerCode,
} from "@lapinamk-ls/domain";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { clientEnv } from "../config/env";
import {
  DashboardAccessError,
  getDashboard,
} from "../features/links/api/get-dashboard";
import {
  DashboardError,
  DashboardPending,
} from "../features/links/dashboard-status";
import { LinkDashboardPage } from "../features/links/link-dashboard-page";

export const Route = createFileRoute("/dashboard/$code")({
  validateSearch: (search: Record<string, unknown>) => ({
    secretCode: typeof search.secretCode === "string" ? search.secretCode : "",
  }),
  loaderDeps: ({ search }) => ({ secretCode: search.secretCode }),
  staleTime: 0,
  gcTime: 0,
  pendingComponent: DashboardPending,
  errorComponent: DashboardError,
  loader: async ({ params, deps, abortController }) => {
    const managerCode = normalizeManagerCode(deps.secretCode);
    if (!isLinkCode(params.code) || !managerCode) {
      throw redirect({ to: "/", replace: true });
    }
    try {
      const link = await getDashboard(
        clientEnv.VITE_API_URL,
        params.code,
        managerCode,
        { signal: abortController.signal },
      );
      return { link, editCode: formatManagerCode(managerCode) };
    } catch (error) {
      if (error instanceof DashboardAccessError)
        throw redirect({ to: "/", replace: true });
      throw error;
    }
  },
  component: DashboardRoute,
});

function DashboardRoute() {
  const { link, editCode } = Route.useLoaderData();
  return <LinkDashboardPage link={link} editCode={editCode} />;
}
