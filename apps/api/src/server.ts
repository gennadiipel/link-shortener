import { createDatabase, KyselyLinkRepository } from "@lapinamk-ls/database";
import { createApp } from "./app";
import { loadApiConfig } from "./config/env";

let database: ReturnType<typeof createDatabase> | undefined;

try {
  const config = loadApiConfig();
  database = createDatabase(config.DATABASE_URL);
  const app = createApp(config, {
    linkRepository: new KyselyLinkRepository(database),
  });

  app.addHook("onClose", async () => {
    await database?.destroy();
  });

  await app.listen({ host: "0.0.0.0", port: config.API_PORT });
} catch (error) {
  await database?.destroy();
  console.error(error);
  process.exit(1);
}
