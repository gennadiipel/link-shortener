import type { LinkCache, LinkRepository } from "./link";

export interface ResolveLinkDependencies {
  linkCache: LinkCache;
  linkRepository: LinkRepository;
}

export interface ResolveLinkResult {
  cacheUpdated: boolean;
  source: "cache" | "database" | "not-found";
  targetUrl: string | undefined;
}

export async function resolveLink(
  code: string,
  dependencies: ResolveLinkDependencies,
): Promise<ResolveLinkResult> {
  try {
    const targetUrl = await dependencies.linkCache.getTargetUrl(code);

    if (targetUrl) {
      await dependencies.linkCache.incrementOpens(code);

      return { cacheUpdated: true, source: "cache", targetUrl };
    }
  } catch {
    // Redis is a best-effort cache. Resolve the durable link below.
  }

  const link = await dependencies.linkRepository.findByCode(code);

  if (!link) {
    return { cacheUpdated: false, source: "not-found", targetUrl: undefined };
  }

  try {
    await dependencies.linkCache.repair(link);
    await dependencies.linkCache.incrementOpens(link.code);

    return {
      cacheUpdated: true,
      source: "database",
      targetUrl: link.targetUrl,
    };
  } catch {
    return {
      cacheUpdated: false,
      source: "database",
      targetUrl: link.targetUrl,
    };
  }
}
