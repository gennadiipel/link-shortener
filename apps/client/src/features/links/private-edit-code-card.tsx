import { useId } from "react";
import { Button } from "../../components/ui/button";
import { HelperText } from "../../components/ui/helper-text";
import { TextField } from "../../components/ui/text-field";

type PrivateEditCodeCardProps = {
  code: string;
  shortUrl: string;
};

export function PrivateEditCodeCard({
  code,
  shortUrl,
}: PrivateEditCodeCardProps) {
  const headingId = useId();
  const descriptionId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="flex min-w-0 flex-col gap-4 rounded-xl border border-outline bg-subtle p-4 sm:p-5"
    >
      <div className="flex flex-col gap-1">
        <h3 id={headingId} className="text-base leading-normal font-semibold">
          Private edit-access code
        </h3>
        <p id={descriptionId} className="text-[13px] leading-normal text-muted">
          Save this code to update the destination URL later. It does not change
          the shortened link slug.
        </p>
      </div>
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
        <TextField
          label="Private edit-access code"
          hideLabel
          value={code}
          readOnly
          aria-describedby={descriptionId}
          containerClassName="sm:flex-1"
          className="font-semibold"
        />
        <Button variant="secondary" aria-disabled="true">
          Copy code
        </Button>
      </div>
      <div className="flex flex-col gap-2.5">
        <HelperText>
          Save this code somewhere secure so you can return and update the
          destination URL later.
        </HelperText>
        <HelperText>
          This code only grants editing access for this specific shortened link
          and does not change the slug{" "}
          <span className="wrap-anywhere">{shortUrl}</span>.
        </HelperText>
      </div>
    </section>
  );
}
