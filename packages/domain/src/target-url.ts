export class InvalidTargetUrlError extends Error {
  constructor() {
    super("Target URL must be an absolute HTTP or HTTPS URL.");
    this.name = "InvalidTargetUrlError";
  }
}

export function normalizeTargetUrl(value: string): string {
  let targetUrl: URL;

  try {
    targetUrl = new URL(value);
  } catch {
    throw new InvalidTargetUrlError();
  }

  if (targetUrl.protocol !== "http:" && targetUrl.protocol !== "https:") {
    throw new InvalidTargetUrlError();
  }

  return targetUrl.toString();
}
