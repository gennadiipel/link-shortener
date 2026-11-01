import cors from "@fastify/cors";
import Fastify from "fastify";
import type { ApiConfig } from "../config/env";
import { registerHealthRoute } from "./routes/health";
import { registerCreateLinkRoute } from "./routes/links/create";
import { registerResolveLinkRoute } from "./routes/links/resolve";
import type { HttpDependencies } from "./types";

export function createHttpApp(
  config: ApiConfig,
  dependencies: HttpDependencies,
) {
  const app = Fastify({ logger: true });

  app.register(cors, { origin: config.CLIENT_ORIGIN });
  registerHealthRoute(app);
  registerCreateLinkRoute(app, config, dependencies);
  registerResolveLinkRoute(app, dependencies);

  return app;
}
