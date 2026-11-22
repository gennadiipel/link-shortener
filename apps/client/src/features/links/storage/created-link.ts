import type { CreatedLink } from "../api/create-link";

export const createdLinkStorageKey = "link-shortener.created-link";

export type StoredCreatedLink = CreatedLink & { targetUrl: string };

export function saveCreatedLink(
  link: StoredCreatedLink,
  storage: Pick<Storage, "setItem"> = window.sessionStorage,
): void {
  storage.setItem(createdLinkStorageKey, JSON.stringify(link));
}
