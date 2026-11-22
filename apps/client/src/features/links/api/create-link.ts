import { normalizeManagerCode } from "@lapinamk-ls/domain";
import { z } from "zod";
import { parseShortLinkCode } from "../dashboard-location";

const createdLinkSchema = z.object({
  shortUrl: z.url().refine((value) => !!parseShortLinkCode(value)),
  secretCode: z.string().refine((value) => !!normalizeManagerCode(value)),
});

export type CreatedLink = z.infer<typeof createdLinkSchema>;

export class CreateLinkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CreateLinkError";
  }
}

export async function createShortLink(
  baseUrl: string,
  targetUrl: string,
  fetchRequest: (url: string, init: RequestInit) => Promise<Response> = fetch,
): Promise<CreatedLink> {
  let response: Response;
  try {
    response = await fetchRequest(`${baseUrl.replace(/\/+$/, "")}/links`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUrl }),
    });
  } catch {
    throw new CreateLinkError(
      "Could not reach the link service. Please try again.",
    );
  }
  if (!response.ok) {
    throw new CreateLinkError(
      response.status === 400
        ? "The service could not accept this URL. Check it and try again."
        : "Could not shorten the link. Please try again.",
    );
  }
  try {
    return createdLinkSchema.parse(await response.json());
  } catch {
    throw new CreateLinkError(
      "The service returned an invalid response. Please try again.",
    );
  }
}
