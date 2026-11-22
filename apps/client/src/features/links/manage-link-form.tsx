import { useId } from "react";
import { Button } from "../../components/ui/button";
import { FormCard } from "../../components/ui/form-card";
import { HelperText } from "../../components/ui/helper-text";
import { TextField } from "../../components/ui/text-field";
import { useManageLink } from "./use-manage-link";

export function ManageLinkForm() {
  const helperId = useId();
  const management = useManageLink();

  return (
    <FormCard
      title="Manage the existing link"
      description="Enter your shortened URL and private edit code to manage your link."
      className="gap-3"
    >
      <form
        aria-label="Manage an existing link"
        noValidate
        aria-busy={management.isPending}
        className="flex min-w-0 flex-col gap-3 md:flex-row md:items-start"
        onSubmit={(event) => {
          event.preventDefault();
          void management.submit();
        }}
      >
        <TextField
          label="Shortened URL"
          name="shortUrl"
          ref={management.urlRef}
          value={management.shortUrl}
          onChange={(event) =>
            management.change("shortUrl", event.currentTarget.value)
          }
          readOnly={management.isPending}
          error={management.errors.shortUrl}
          type="url"
          placeholder="Enter your shortened URL"
          autoCapitalize="none"
          spellCheck={false}
          containerClassName="md:flex-1"
        />
        <TextField
          label="Private edit code"
          name="editCode"
          ref={management.secretRef}
          value={management.secretCode}
          onChange={(event) =>
            management.change("secretCode", event.currentTarget.value)
          }
          readOnly={management.isPending}
          error={management.errors.secretCode}
          type="text"
          placeholder="Enter private edit code"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          aria-describedby={helperId}
          containerClassName="md:flex-1"
        />
        <Button
          type="submit"
          disabled={management.isPending}
          className="md:mt-6"
        >
          {management.isPending ? "Opening…" : "Manage link"}
        </Button>
      </form>
      {management.submitError && (
        <p role="alert" className="text-sm text-danger">
          {management.submitError}
        </p>
      )}
      <HelperText id={helperId}>
        This code is the private edit credential from your dashboard, not the
        shortened URL slug.
      </HelperText>
    </FormCard>
  );
}
