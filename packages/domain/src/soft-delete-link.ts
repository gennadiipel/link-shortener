import { getManagedLink } from "./get-managed-link";
import type { LinkCache, LinkRepository } from "./link";

export async function softDeleteManagedLink(
  code: string,
  secretCode: string,
  dependencies: { linkRepository: LinkRepository; linkCache: LinkCache },
): Promise<boolean> {
  const link = await getManagedLink(code, secretCode, dependencies);
  if (!link) return false;

  const cachedOpens = await dependencies.linkCache.getOpens(code);
  if (!(await dependencies.linkRepository.softDelete(code, cachedOpens)))
    return false;
  await dependencies.linkCache.clear(code);
  return true;
}
