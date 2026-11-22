export function isLinkCode(value: string): boolean {
  return /^[a-z0-9]{7}$/.test(value);
}

export function normalizeManagerCode(value: string): string | undefined {
  const normalized = value.trim().replaceAll("-", "").toUpperCase();
  return /^[A-HJ-KM-NP-Z2-9]{16}$/.test(normalized) ? normalized : undefined;
}
