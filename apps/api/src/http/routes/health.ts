import type { FastifyInstance } from "fastify";

export function registerHealthRoute(app: FastifyInstance): void {
  app.get("/hello", async () => ({ message: "Hello, world!" }));
}
