import { z } from "zod";

export const createLinkBodySchema = z
  .object({ targetUrl: z.string() })
  .strict();
