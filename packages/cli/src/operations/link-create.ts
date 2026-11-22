import { createRedisClient, RedisLinkCache } from "@lapinamk-ls/cache";
import { createDatabase, KyselyLinkRepository } from "@lapinamk-ls/database";
import { createLink, formatManagerCode } from "@lapinamk-ls/domain";
import type { CliOptions } from "../types";

export async function createLinkCommand(
  targetUrl: string,
  options: CliOptions,
): Promise<void> {
  const database = createDatabase(options.databaseUrl);
  const redisClient = createRedisClient(options.redisUrl);

  try {
    const result = await createLink(targetUrl, {
      linkCache: new RedisLinkCache(redisClient),
      linkRepository: new KyselyLinkRepository(database),
    });
    const { link } = result;

    console.log(`Created link ${link.code} -> ${link.targetUrl}`);
    console.log(
      `Manager code (shown once): ${formatManagerCode(link.managerCode)}`,
    );

    if (!result.cacheWritten) {
      console.warn("Link was created, but Redis cache population failed.");
    }
  } finally {
    await database.destroy();
    redisClient.close();
  }
}
