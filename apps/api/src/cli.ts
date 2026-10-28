import { runCli } from "@lapinamk-ls/cli";
import { loadApiConfig } from "./config/env";

try {
  const config = loadApiConfig();
  await runCli(process.argv.slice(2), { databaseUrl: config.DATABASE_URL });
} catch (error) {
  console.error(error);
  process.exit(1);
}
