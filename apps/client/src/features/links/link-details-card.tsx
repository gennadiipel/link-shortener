import { Button } from "../../components/ui/button";
import { CopyButton } from "../../components/ui/copy-button";
import { FormCard } from "../../components/ui/form-card";
import { MetricCard } from "../../components/ui/metric-card";
import { TextField } from "../../components/ui/text-field";
import { PrivateEditCodeCard } from "./private-edit-code-card";
import { useDeleteLink } from "./use-delete-link";

type LinkDetailsCardProps = {
  totalClicks: string | number;
  shortUrl: string;
  destinationUrl: string;
  editCode: string;
  isDeleted: boolean;
};

export function LinkDetailsCard({
  totalClicks,
  shortUrl,
  destinationUrl,
  editCode,
  isDeleted,
}: LinkDetailsCardProps) {
  const deletion = useDeleteLink(shortUrl, editCode, isDeleted);
  return (
    <FormCard
      title="Link details"
      description={
        isDeleted
          ? "Saved information for this deleted link. Copying is still available."
          : "Everything you need to review, copy, and manage this shortened link."
      }
      className="gap-5"
    >
      <dl className="grid min-w-0 grid-cols-1 items-start gap-4 lg:grid-cols-3">
        <MetricCard
          label="Total clicks"
          value={totalClicks}
          valueSize="large"
          description="Lifetime clicks since the link was created"
        />
        <MetricCard
          label="Shortened link"
          value={shortUrl}
          description="The public shortened URL"
        />
        <MetricCard
          label="Destination URL"
          value={destinationUrl}
          description="The original URL this link points to"
        />
      </dl>
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
        <TextField
          label="Shortened link"
          hideLabel
          value={shortUrl}
          readOnly
          containerClassName="sm:flex-1"
        />
        <CopyButton key={shortUrl} value={shortUrl} label="Copy" />
        <Button
          variant="secondary"
          disabled={isDeleted || deletion.isPending}
          onClick={() => {
            void deletion.remove();
          }}
        >
          {isDeleted ? "Deleted" : deletion.isPending ? "Deleting…" : "Delete"}
        </Button>
      </div>
      {deletion.error && (
        <p role="alert" className="text-sm text-danger">
          {deletion.error}
        </p>
      )}
      <PrivateEditCodeCard
        code={editCode}
        shortUrl={shortUrl}
        isDeleted={isDeleted}
      />
    </FormCard>
  );
}
