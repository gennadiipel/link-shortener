import { formatManagerCode, type Link } from "@lapinamk-ls/domain";

function createShortUrl(publicBaseUrl: string, code: string): string {
  const baseUrl = publicBaseUrl.endsWith("/")
    ? publicBaseUrl
    : `${publicBaseUrl}/`;

  return new URL(code, baseUrl).toString();
}

export function presentCreatedLink(publicBaseUrl: string, link: Link) {
  return {
    secretCode: formatManagerCode(link.managerCode),
    shortUrl: createShortUrl(publicBaseUrl, link.code),
  };
}
