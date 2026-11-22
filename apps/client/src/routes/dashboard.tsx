import { createFileRoute } from "@tanstack/react-router";
import { LinkDashboardPage } from "../features/links/link-dashboard-page";

export const Route = createFileRoute("/dashboard")({
  component: LinkDashboardPage,
});
