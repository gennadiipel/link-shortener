import { Button } from "../../components/ui/button";
import { FormCard } from "../../components/ui/form-card";
import { MetricCard } from "../../components/ui/metric-card";
import { TextField } from "../../components/ui/text-field";
import { PrivateEditCodeCard } from "./private-edit-code-card";

type LinkDetailsCardProps = {
  totalClicks: string | number;
  shortUrl: string;
  destinationUrl: string;
  editCode: string;
};

export function LinkDetailsCard({
  totalClicks,
  shortUrl,
  destinationUrl,
  editCode,
}: LinkDetailsCardProps) {
  return (
    <FormCard
      title="Link details"
      description="Everything you need to review, copy, and manage this shortened link."
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
        <Button variant="secondary" aria-disabled="true">
          Copy
        </Button>
        <Button variant="secondary" aria-disabled="true">
          Delete
        </Button>
      </div>
      <PrivateEditCodeCard code={editCode} shortUrl={shortUrl} />
    </FormCard>
  );
}
