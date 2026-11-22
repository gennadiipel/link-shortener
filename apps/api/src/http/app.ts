import cors from "@fastify/cors";
import Fastify from "fastify";
import type { ApiConfig } from "../config/env";
import { registerHealthRoute } from "./routes/health";
import { registerCreateLinkRoute } from "./routes/links/create";
import { registerLinkDashboardRoute } from "./routes/links/dashboard";
import { registerDeleteLinkRoute } from "./routes/links/delete";
import { registerResolveLinkRoute } from "./routes/links/resolve";
import type { HttpDependencies } from "./types";

export function createHttpApp(
  config: ApiConfig,
  dependencies: HttpDependencies,
) {
  const app = Fastify({
    logger: {
      level: "warn",
      serializers: {
        req: (request) => ({
          method: request.method,
          url: request.url?.split("?", 1)[0],
        }),
      },
    },
  });

  app.register(cors, {
    origin: config.CLIENT_ORIGIN,
    methods: ["GET", "HEAD", "POST", "DELETE"],
  });
  registerHealthRoute(app);
  registerCreateLinkRoute(app, config, dependencies);
  registerLinkDashboardRoute(app, config, dependencies);
  registerDeleteLinkRoute(app, dependencies);
  registerResolveLinkRoute(app, dependencies);

  return app;
}
