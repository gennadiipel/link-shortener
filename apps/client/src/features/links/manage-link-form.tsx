import { useId } from "react";
import { Button } from "../../components/ui/button";
import { FormCard } from "../../components/ui/form-card";
import { HelperText } from "../../components/ui/helper-text";
import { TextField } from "../../components/ui/text-field";

export function ManageLinkForm() {
  const helperId = useId();

  return (
    <FormCard
      title="Manage the existing link"
      description="Enter your shortened URL and private edit code to manage your link."
      className="gap-3"
    >
      <form
        aria-label="Manage an existing link"
        noValidate
        className="flex min-w-0 flex-col gap-3 md:flex-row md:items-end"
        onSubmit={(event) => event.preventDefault()}
      >
        <TextField
          label="Shortened URL"
          name="shortUrl"
          type="url"
          placeholder="Enter your shortened URL"
          autoCapitalize="none"
          spellCheck={false}
          containerClassName="md:flex-1"
        />
        <TextField
          label="Private edit code"
          name="editCode"
          type="text"
          placeholder="Enter private edit code"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          aria-describedby={helperId}
          containerClassName="md:flex-1"
        />
        <Button aria-disabled="true">Manage link</Button>
      </form>
      <HelperText id={helperId}>
        This code is the private edit credential from your dashboard, not the
        shortened URL slug.
      </HelperText>
    </FormCard>
  );
}
