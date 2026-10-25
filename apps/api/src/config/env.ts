import { z } from "zod";

const apiEnvSchema = z.object({
  APP_ENV: z.enum(["development", "production"]),
  API_PORT: z.coerce.number().int().min(1).max(65535),
  CLIENT_ORIGIN: z.url(),
  DATABASE_URL: z.url(),
  REDIS_URL: z.url(),
});

export type ApiConfig = z.infer<typeof apiEnvSchema>;

export function loadApiConfig(
  environment: Record<string, string | undefined> = process.env,
): ApiConfig {
  const result = apiEnvSchema.safeParse(environment);

  if (result.success) {
    return result.data;
  }

  const errors = result.error.issues
    .map((issue) => `- ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  throw new Error(`Invalid API environment configuration:\n${errors}`);
}
