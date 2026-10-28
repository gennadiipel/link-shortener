import { migrateDatabase } from "@lapinamk-ls/database";
import { loadApiConfig } from "./config/env";

try {
  const config = loadApiConfig();
  await migrateDatabase(config.DATABASE_URL);
} catch (error) {
  console.error(error);
  process.exit(1);
}
