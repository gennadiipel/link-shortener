import { resolveLink } from "@lapinamk-ls/domain";
import type { FastifyInstance } from "fastify";
import type { HttpDependencies } from "../../types";

const cacheControlHeader = "no-store";

export function registerResolveLinkRoute(
  app: FastifyInstance,
  dependencies: HttpDependencies,
): void {
  app.get<{ Params: { code: string } }>(
    "/links/:code/redirect",
    async (request, reply) => {
      const result = await resolveLink(request.params.code, dependencies);

      if (!result.link) {
        return reply
          .header("cache-control", cacheControlHeader)
          .code(404)
          .send({ message: "Link not found." });
      }

      if (!result.cacheUpdated) {
        request.log.warn(
          { code: result.link.code },
          "Link resolved but Redis cache repair failed.",
        );
      }

      return reply
        .header("cache-control", cacheControlHeader)
        .redirect(result.link.targetUrl, 302);
    },
  );
}
