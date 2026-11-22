import { useId } from "react";
import { Button } from "../../components/ui/button";
import { FormCard } from "../../components/ui/form-card";
import { HelperText } from "../../components/ui/helper-text";
import { TextField } from "../../components/ui/text-field";

export function ShortenLinkForm() {
  const helperId = useId();

  return (
    <FormCard
      title="Shorten a link"
      description="Paste the full URL you want to shorten."
      className="gap-5"
    >
      <form
        aria-label="Shorten a link"
        noValidate
        className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center"
        onSubmit={(event) => event.preventDefault()}
      >
        <TextField
          label="URL to shorten"
          hideLabel
          name="targetUrl"
          type="url"
          placeholder="https://example.com/long-page"
          autoCapitalize="none"
          spellCheck={false}
          aria-describedby={helperId}
          containerClassName="sm:flex-1"
          className="placeholder:text-ink!"
        />
        <Button aria-disabled="true">Shorten</Button>
      </form>
      <HelperText id={helperId}>
        The next screen will show the shortened link and a private edit code you
        can save for future changes.
      </HelperText>
    </FormCard>
  );
}
