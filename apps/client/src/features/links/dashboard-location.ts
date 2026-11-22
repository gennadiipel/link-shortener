import {
  formatManagerCode,
  isLinkCode,
  normalizeManagerCode,
  normalizeTargetUrl,
} from "@lapinamk-ls/domain";

export function parseShortLinkCode(value: string): string | undefined {
  try {
    const url = new URL(normalizeTargetUrl(value));
    const code = url.pathname.split("/").filter(Boolean).at(-1);
    return code && isLinkCode(code) ? code : undefined;
  } catch {
    return undefined;
  }
}

export function dashboardLocation(shortUrl: string, secretCode: string) {
  const code = parseShortLinkCode(shortUrl);
  const managerCode = normalizeManagerCode(secretCode);
  if (!code || !managerCode) throw new Error("Invalid link credentials.");

  return {
    to: "/dashboard/$code" as const,
    params: { code },
    search: { secretCode: formatManagerCode(managerCode) },
  };
}
