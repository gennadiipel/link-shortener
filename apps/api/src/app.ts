import cors from "@fastify/cors";
import Fastify from "fastify";

export function createApp() {
  const app = Fastify({ logger: true });

  app.register(cors, {
    origin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
  });

  app.get("/hello", async () => ({ message: "Hello, world!" }));

  return app;
}
