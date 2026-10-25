import cors from "@fastify/cors";
import Fastify from "fastify";
import type { ApiConfig } from "./config/env";

export function createApp(config: ApiConfig) {
  const app = Fastify({ logger: true });

  app.register(cors, {
    origin: config.CLIENT_ORIGIN,
  });

  app.get("/hello", async () => ({ message: "Hello, world!" }));

  return app;
}
