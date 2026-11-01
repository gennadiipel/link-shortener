import type { Link, LinkCache, LinkRepository } from "./link";

export interface ResolveLinkDependencies {
  linkCache: LinkCache;
  linkRepository: LinkRepository;
}

export interface ResolveLinkResult {
  cacheUpdated: boolean;
  link: Link | undefined;
}

export async function resolveLink(
  code: string,
  dependencies: ResolveLinkDependencies,
): Promise<ResolveLinkResult> {
  const link = await dependencies.linkRepository.findByCode(code);

  if (!link) {
    return { cacheUpdated: false, link: undefined };
  }

  try {
    await dependencies.linkCache.repair(link);
    await dependencies.linkCache.incrementOpens(link.code);

    return { cacheUpdated: true, link };
  } catch {
    return { cacheUpdated: false, link };
  }
}
