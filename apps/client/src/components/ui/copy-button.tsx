import { useEffect, useRef, useState } from "react";
import { Button } from "./button";

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    setPending(true);
    setError(false);
    setCopied(false);
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-w-0 shrink-0 flex-col gap-1">
      <Button
        variant="secondary"
        disabled={pending}
        onClick={() => {
          void copy();
        }}
      >
        {copied ? "Copied!" : label}
      </Button>
      <span role="status" className="sr-only">
        {copied ? "Copied to clipboard." : ""}
      </span>
      {error && (
        <p role="alert" className="max-w-48 text-xs text-danger">
          Could not copy. Select the text above and copy it.
        </p>
      )}
    </div>
  );
}
