import { PageLayout } from "../../components/page-layout";
import { PagePanel } from "../../components/page-panel";
import { ManageLinkForm } from "./manage-link-form";
import { ShortenLinkForm } from "./shorten-link-form";

export function CreateLinkPage() {
  return (
    <PageLayout>
      <PagePanel
        title="Create a link"
        description="Paste a URL and shorten it. You’ll get a dashboard with the shortened link and a private edit code."
      >
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] leading-[1.3] font-bold">Shorten a URL</h1>
          <p className="text-sm leading-normal text-muted">
            Paste the full URL you want to shorten.
          </p>
        </div>
        <ShortenLinkForm />
        <ManageLinkForm />
      </PagePanel>
    </PageLayout>
  );
}
