import { normalizeManagerCode } from "@lapinamk-ls/domain";
import { useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { dashboardLocation, parseShortLinkCode } from "./dashboard-location";

function validate(shortUrl: string, secretCode: string) {
  return {
    shortUrl: parseShortLinkCode(shortUrl)
      ? null
      : "Enter a valid shortened HTTP or HTTPS URL.",
    secretCode: normalizeManagerCode(secretCode)
      ? null
      : "Enter the 16-character private edit code.",
  };
}

export function useManageLink() {
  const navigate = useNavigate();
  const urlRef = useRef<HTMLInputElement>(null);
  const secretRef = useRef<HTMLInputElement>(null);
  const inFlight = useRef(false);
  const attempted = useRef(false);
  const [shortUrl, setShortUrl] = useState("");
  const [secretCode, setSecretCode] = useState("");
  const [errors, setErrors] = useState<{
    shortUrl: string | null;
    secretCode: string | null;
  }>({ shortUrl: null, secretCode: null });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, setPending] = useState(false);

  function change(field: "shortUrl" | "secretCode", value: string) {
    if (inFlight.current) return;
    if (field === "shortUrl") setShortUrl(value);
    else setSecretCode(value);
    setSubmitError(null);
    if (attempted.current)
      setErrors(
        validate(
          field === "shortUrl" ? value : shortUrl,
          field === "secretCode" ? value : secretCode,
        ),
      );
  }

  async function submit() {
    if (inFlight.current) return;
    attempted.current = true;
    const nextErrors = validate(shortUrl, secretCode);
    setErrors(nextErrors);
    if (nextErrors.shortUrl || nextErrors.secretCode) {
      (nextErrors.shortUrl ? urlRef : secretRef).current?.focus();
      return;
    }
    inFlight.current = true;
    setPending(true);
    setSubmitError(null);
    try {
      await navigate(dashboardLocation(shortUrl, secretCode));
    } catch {
      setSubmitError("Could not open the dashboard. Please try again.");
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  return {
    shortUrl,
    secretCode,
    errors,
    submitError,
    isPending,
    urlRef,
    secretRef,
    change,
    submit,
  };
}
