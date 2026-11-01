import { createRedisClient, RedisLinkCache } from "@lapinamk-ls/cache";
import { createDatabase, KyselyLinkRepository } from "@lapinamk-ls/database";
import { createLink, formatManagerCode } from "@lapinamk-ls/domain";

export interface CliOptions {
  databaseUrl: string;
  redisUrl: string;
}

export async function runCli(
  arguments_: string[],
  options: CliOptions,
): Promise<void> {
  const [command, targetUrl, ...extraArguments] = arguments_;

  if (command !== "link:create" || !targetUrl || extraArguments.length > 0) {
    throw new Error("Usage: bun run cli link:create <target-url>");
  }

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
