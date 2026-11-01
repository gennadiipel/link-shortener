import type { LinkCache, LinkRepository } from "@lapinamk-ls/domain";

export interface HttpDependencies {
  linkCache: LinkCache;
  linkRepository: LinkRepository;
}
