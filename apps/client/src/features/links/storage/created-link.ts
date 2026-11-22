import type { CreatedLink } from "../api/create-link";

export const createdLinkStorageKey = "link-shortener.created-link";

export type StoredCreatedLink = CreatedLink & { targetUrl: string };

export function saveCreatedLink(
  link: StoredCreatedLink,
  storage: Pick<Storage, "setItem"> = window.sessionStorage,
): void {
  storage.setItem(createdLinkStorageKey, JSON.stringify(link));
}

export function removeCreatedLink(
  shortUrl: string,
  storage: Pick<Storage, "getItem" | "removeItem"> = window.sessionStorage,
): void {
  const saved = storage.getItem(createdLinkStorageKey);
  if (saved && JSON.parse(saved)?.shortUrl === shortUrl)
    storage.removeItem(createdLinkStorageKey);
}
