import { createRedisClient, RedisLinkCache } from "@lapinamk-ls/cache";
import { createDatabase, KyselyLinkRepository } from "@lapinamk-ls/database";
import type { ApiConfig } from "../config/env";
import { createHttpApp } from "../http/app";

export function createRuntime(config: ApiConfig) {
  const database = createDatabase(config.DATABASE_URL);
  const redisClient = createRedisClient(config.REDIS_URL);
  const app = createHttpApp(config, {
    linkCache: new RedisLinkCache(redisClient),
    linkRepository: new KyselyLinkRepository(database),
  });

  app.addHook("onClose", async () => {
    try {
      await database.destroy();
    } finally {
      redisClient.close();
    }
  });

  return app;
}
