import { z } from "zod";
import { type HttpClient, HttpError } from "../../../api/http-client";

const createdLinkSchema = z.object({
  shortUrl: z.url(),
  secretCode: z.string().min(1),
});

export type CreatedLink = z.infer<typeof createdLinkSchema>;

export class CreateLinkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CreateLinkError";
  }
}

export async function createShortLink(
  client: HttpClient,
  targetUrl: string,
): Promise<CreatedLink> {
  let body: unknown;

  try {
    body = await client.post("/links", { targetUrl });
  } catch (error) {
    if (error instanceof HttpError) {
      throw new CreateLinkError(
        error.status === 400
          ? "The service could not accept this URL. Check it and try again."
          : "Could not shorten the link. Please try again.",
      );
    }

    throw new CreateLinkError(
      error instanceof SyntaxError
        ? "The service returned an invalid response. Please try again."
        : "Could not reach the link service. Please try again.",
    );
  }

  const result = createdLinkSchema.safeParse(body);

  if (!result.success) {
    throw new CreateLinkError(
      "The service returned an invalid response. Please try again.",
    );
  }

  return result.data;
}
