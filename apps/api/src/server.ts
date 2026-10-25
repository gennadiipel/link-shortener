import { createApp } from "./app";

const app = createApp();
const port = Number(process.env.API_PORT ?? 8000);

try {
  await app.listen({ host: "0.0.0.0", port });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
