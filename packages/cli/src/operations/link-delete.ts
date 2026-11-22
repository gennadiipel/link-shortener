import { clearLinkCache, createRedisClient } from "@lapinamk-ls/cache";
import { createDatabase, KyselyLinkRepository } from "@lapinamk-ls/database";
import type { CliOptions } from "../types";

export async function hardDeleteLink(
  code: string,
  options: CliOptions,
): Promise<void> {
  const database = createDatabase(options.databaseUrl);
  const redisClient = createRedisClient(options.redisUrl);

  try {
    const deleted = await new KyselyLinkRepository(database).hardDelete(code);
    await clearLinkCache(redisClient, code);
    console.log(
      deleted
        ? `Deleted link ${code}.`
        : `Link ${code} was absent; cache cleared.`,
    );
  } finally {
    await database.destroy();
    redisClient.close();
  }
}
