import { clearLinkCache, createRedisClient } from "@lapinamk-ls/cache";
import type { CliOptions } from "../types";

export async function clearCache(
  code: string,
  options: CliOptions,
): Promise<void> {
  const redisClient = createRedisClient(options.redisUrl);

  try {
    await clearLinkCache(redisClient, code);
    console.log(`Cleared Redis cache for link ${code}.`);
  } finally {
    redisClient.close();
  }
}
