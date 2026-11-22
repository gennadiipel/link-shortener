import { getManagedLink } from "@lapinamk-ls/domain";
import type { FastifyInstance } from "fastify";
import type { ApiConfig } from "../../../config/env";
import type { HttpDependencies } from "../../types";
import { presentManagedLink } from "./presenter";

export function registerLinkDashboardRoute(
  app: FastifyInstance,
  config: ApiConfig,
  dependencies: HttpDependencies,
): void {
  app.get<{ Params: { code: string }; Querystring: { secretCode?: string } }>(
    "/links/:code/dashboard",
    async (request, reply) => {
      reply.header("Cache-Control", "no-store");
      const link =
        typeof request.query.secretCode === "string"
          ? await getManagedLink(
              request.params.code,
              request.query.secretCode,
              dependencies,
            )
          : undefined;

      if (!link) return reply.code(404).send({ message: "Link not found." });
      return presentManagedLink(config.PUBLIC_BASE_URL, link);
    },
  );
}
