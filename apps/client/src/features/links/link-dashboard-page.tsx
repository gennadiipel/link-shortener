import { PageLayout } from "../../components/page-layout";
import { PagePanel } from "../../components/page-panel";
import type { LinkDashboard } from "./api/get-dashboard";
import { LinkDetailsCard } from "./link-details-card";
import { ManageLinkForm } from "./manage-link-form";

export function LinkDashboardPage({
  link,
  editCode,
}: {
  link: LinkDashboard;
  editCode: string;
}) {
  return (
    <PageLayout>
      <PagePanel
        title={link.shortUrl}
        description="This is the dashboard for one shortened link. You’ll see its performance, destination URL, and a private edit code for future changes."
      >
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] leading-[1.3] font-bold">
            Your shortened link
          </h1>
          <p className="text-sm leading-normal text-muted">
            This service is account-free. You created one link, and this
            dashboard shows its current state. Use the private edit code below
            to update the destination URL later.
          </p>
        </div>
        <LinkDetailsCard
          totalClicks={link.opens}
          shortUrl={link.shortUrl}
          destinationUrl={link.targetUrl}
          editCode={editCode}
        />
        <ManageLinkForm />
      </PagePanel>
    </PageLayout>
  );
}
