import { InvalidTargetUrlError, normalizeTargetUrl } from "@lapinamk-ls/domain";
import { useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { createHttpClient } from "../../api/http-client";
import { clientEnv } from "../../config/env";
import { CreateLinkError, createShortLink } from "./api/create-link";
import {
  type StoredCreatedLink,
  saveCreatedLink,
} from "./storage/created-link";

const httpClient = createHttpClient(clientEnv.VITE_API_URL);

function validateTargetUrl(value: string) {
  if (!value.trim()) {
    return { error: "Enter a URL to shorten.", targetUrl: null };
  }

  try {
    return { error: null, targetUrl: normalizeTargetUrl(value) };
  } catch (error) {
    if (error instanceof InvalidTargetUrlError) {
      return { error: error.message, targetUrl: null };
    }

    throw error;
  }
}

export function useCreateLink() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const inFlight = useRef(false);
  const hasSubmitted = useRef(false);
  const [targetUrl, setTargetUrl] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"idle" | "creating" | "continuing">(
    "idle",
  );
  const [createdLink, setCreatedLink] = useState<StoredCreatedLink | null>(
    null,
  );

  function changeTargetUrl(value: string) {
    if (inFlight.current || createdLink) return;

    setTargetUrl(value);
    setSubmitError(null);

    if (hasSubmitted.current) {
      setFieldError(validateTargetUrl(value).error);
    }
  }

  async function submit() {
    if (inFlight.current) return;

    hasSubmitted.current = true;
    const validated = validateTargetUrl(targetUrl);
    setFieldError(validated.error);

    if (validated.targetUrl === null) {
      inputRef.current?.focus();
      return;
    }

    inFlight.current = true;
    setSubmitError(null);

    try {
      let result = createdLink;

      if (!result) {
        setPhase("creating");

        try {
          const response = await createShortLink(
            httpClient,
            validated.targetUrl,
          );
          result = { ...response, targetUrl: validated.targetUrl };
          setCreatedLink(result);
        } catch (error) {
          setSubmitError(
            error instanceof CreateLinkError
              ? error.message
              : "Could not shorten the link. Please try again.",
          );
          return;
        }
      }

      setPhase("continuing");

      try {
        saveCreatedLink(result);
      } catch {
        setSubmitError(
          "Your link was created, but its details could not be saved in this tab. Try continuing again.",
        );
        return;
      }

      try {
        await navigate({ to: "/dashboard" });
      } catch {
        setSubmitError(
          "Your link was created and saved. Try continuing to the dashboard again.",
        );
      }
    } finally {
      inFlight.current = false;
      setPhase("idle");
    }
  }

  return {
    inputRef,
    targetUrl,
    changeTargetUrl,
    fieldError,
    submitError,
    isPending: phase !== "idle",
    isReadOnly: phase !== "idle" || createdLink !== null,
    buttonLabel:
      phase === "creating"
        ? "Shortening…"
        : createdLink
          ? "Continue to dashboard"
          : "Shorten",
    submit,
  };
}
