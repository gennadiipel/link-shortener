import { AppHeader } from "../../components/app-header";
import { ManageLinkForm } from "./manage-link-form";
import { ShortenLinkForm } from "./shorten-link-form";

export function CreateLinkPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />
      <main className="flex-1 bg-workspace p-4 sm:p-8">
        <div className="overflow-hidden rounded-xl border border-outline bg-white">
          <div className="flex flex-col gap-1.5 bg-panel-header px-4 py-5 sm:px-6">
            <p className="text-lg leading-normal font-semibold">
              Create a link
            </p>
            <p className="text-[13px] leading-normal text-muted">
              Paste a URL and shorten it. You’ll get a dashboard with the
              shortened link and a private edit code.
            </p>
          </div>
          <div className="flex min-w-0 flex-col gap-6 p-4 sm:p-8">
            <div className="flex flex-col gap-2">
              <h1 className="text-[28px] leading-[1.3] font-bold">
                Shorten a URL
              </h1>
              <p className="text-sm leading-normal text-muted">
                Paste the full URL you want to shorten.
              </p>
            </div>
            <ShortenLinkForm />
            <ManageLinkForm />
          </div>
        </div>
      </main>
    </div>
  );
}
