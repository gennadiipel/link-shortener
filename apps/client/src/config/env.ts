import { z } from "zod";

const clientEnvSchema = z.object({
  VITE_API_URL: z.union([z.url(), z.literal("/api")]),
  VITE_APP_BASE_PATH: z
    .string()
    .regex(/^\/.+\/$|^\/$/)
    .default("/"),
});

const result = clientEnvSchema.safeParse(import.meta.env);

if (!result.success) {
  const errors = result.error.issues
    .map((issue) => `- ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  throw new Error(`Invalid client environment configuration:\n${errors}`);
}

export const clientEnv = result.data;
