import { PageLayout } from "../../components/page-layout";
import { PagePanel } from "../../components/page-panel";
import { LinkDetailsCard } from "./link-details-card";

const dashboardLink = {
  totalClicks: 128,
  shortUrl: "shortly.co/abc123",
  destinationUrl: "https://example.com/long-page",
  editCode: "EDIT-7F2A-91C4",
};

export function LinkDashboardPage() {
  return (
    <PageLayout>
      <PagePanel
        title={dashboardLink.shortUrl}
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
        <LinkDetailsCard {...dashboardLink} />
      </PagePanel>
    </PageLayout>
  );
}
