import { useId } from "react";
import { Button } from "../../components/ui/button";
import { FormCard } from "../../components/ui/form-card";
import { HelperText } from "../../components/ui/helper-text";
import { TextField } from "../../components/ui/text-field";
import { useCreateLink } from "./use-create-link";

export function ShortenLinkForm() {
  const helperId = useId();
  const creation = useCreateLink();

  return (
    <FormCard
      title="Shorten a link"
      description="Paste the full URL you want to shorten."
      className="gap-5"
    >
      <form
        aria-label="Shorten a link"
        noValidate
        aria-busy={creation.isPending}
        className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start"
        onSubmit={(event) => {
          event.preventDefault();
          void creation.submit();
        }}
      >
        <TextField
          label="URL to shorten"
          hideLabel
          name="targetUrl"
          ref={creation.inputRef}
          type="url"
          value={creation.targetUrl}
          onChange={(event) =>
            creation.changeTargetUrl(event.currentTarget.value)
          }
          readOnly={creation.isReadOnly}
          error={creation.fieldError}
          placeholder="https://example.com/long-page"
          autoCapitalize="none"
          spellCheck={false}
          aria-describedby={helperId}
          containerClassName="sm:flex-1"
          className="placeholder:text-ink!"
        />
        <Button type="submit" disabled={creation.isPending}>
          {creation.buttonLabel}
        </Button>
      </form>
      {creation.submitError && (
        <p role="alert" className="text-sm leading-normal text-danger">
          {creation.submitError}
        </p>
      )}
      <HelperText id={helperId}>
        The next screen will show the shortened link and a private edit code you
        can save for future changes.
      </HelperText>
    </FormCard>
  );
}
