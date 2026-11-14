import {
  createRedisClient,
  RedisLinkCache,
  RedisOpenCountReader,
} from "@lapinamk-ls/cache";
import {
  createDatabase,
  KyselyLinkRepository,
  KyselyOpenCountRepository,
} from "@lapinamk-ls/database";
import type { ApiConfig } from "../config/env";
import { createHttpApp } from "../http/app";
import { startOpenCountFlush } from "./open-count-flush";

export function createRuntime(config: ApiConfig) {
  const database = createDatabase(config.DATABASE_URL);
  const redisClient = createRedisClient(config.REDIS_URL);
  const app = createHttpApp(config, {
    linkCache: new RedisLinkCache(redisClient),
    linkRepository: new KyselyLinkRepository(database),
  });
  const stopOpenCountFlush = startOpenCountFlush(
    new RedisOpenCountReader(redisClient),
    new KyselyOpenCountRepository(database),
    (error) => app.log.error({ err: error }, "Open-count flush failed"),
  );

  app.addHook("onClose", async () => {
    try {
      await stopOpenCountFlush();
    } finally {
      try {
        await database.destroy();
      } finally {
        redisClient.close();
      }
    }
  });

  return app;
}
