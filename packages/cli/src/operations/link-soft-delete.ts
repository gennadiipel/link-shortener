import { clearLinkCache, createRedisClient } from "@lapinamk-ls/cache";
import { createDatabase, KyselyLinkRepository } from "@lapinamk-ls/database";
import type { CliOptions } from "../types";

export async function softDeleteLink(
  code: string,
  options: CliOptions,
): Promise<void> {
  const database = createDatabase(options.databaseUrl);
  const redisClient = createRedisClient(options.redisUrl);

  try {
    let cachedOpens: bigint | undefined;
    let countReadFailed = false;

    try {
      const value = await redisClient.get(`opens:${code}`);
      if (value !== null) cachedOpens = BigInt(value);
    } catch {
      countReadFailed = true;
    }

    const deleted = await new KyselyLinkRepository(database).softDelete(
      code,
      cachedOpens,
    );
    await clearLinkCache(redisClient, code);

    if (countReadFailed) {
      throw new Error(
        `Link ${code} was soft-deleted, but its Redis open count could not be read.`,
      );
    }

    console.log(
      deleted
        ? `Soft-deleted link ${code}.`
        : `Link ${code} was absent; cache cleared.`,
    );
  } finally {
    await database.destroy();
    redisClient.close();
  }
}
