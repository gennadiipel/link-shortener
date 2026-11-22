import type { Link, LinkRepository } from "./link";
import { isLinkCode, normalizeManagerCode } from "./link-credentials";

export async function getManagedLink(
  code: string,
  secretCode: string,
  dependencies: { linkRepository: LinkRepository },
): Promise<Link | undefined> {
  const managerCode = normalizeManagerCode(secretCode);
  if (!isLinkCode(code) || !managerCode) return undefined;

  const link = await dependencies.linkRepository.findByCode(code);
  return link?.managerCode === managerCode ? link : undefined;
}
