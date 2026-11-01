import { createRuntime } from "./composition/runtime";
import { loadApiConfig } from "./config/env";

let app: ReturnType<typeof createRuntime> | undefined;

try {
  const config = loadApiConfig();
  app = createRuntime(config);

  await app.listen({ host: "0.0.0.0", port: config.API_PORT });
} catch (error) {
  await app?.close();
  console.error(error);
  process.exit(1);
}
