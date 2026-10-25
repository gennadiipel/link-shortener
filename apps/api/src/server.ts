import { createApp } from "./app";
import { loadApiConfig } from "./config/env";

try {
  const config = loadApiConfig();
  const app = createApp(config);

  await app.listen({ host: "0.0.0.0", port: config.API_PORT });
} catch (error) {
  console.error(error);
  process.exit(1);
}
