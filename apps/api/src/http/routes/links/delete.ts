import { softDeleteManagedLink } from "@lapinamk-ls/domain";
import type { FastifyInstance } from "fastify";
import type { HttpDependencies } from "../../types";

export function registerDeleteLinkRoute(
  app: FastifyInstance,
  dependencies: HttpDependencies,
): void {
  app.delete<{
    Params: { code: string };
    Querystring: { secretCode?: string };
  }>("/links/:code", async (request, reply) => {
    reply.header("Cache-Control", "no-store");
    const deleted =
      typeof request.query.secretCode === "string"
        ? await softDeleteManagedLink(
            request.params.code,
            request.query.secretCode,
            dependencies,
          )
        : false;
    if (!deleted) return reply.code(404).send({ message: "Link not found." });
    return reply.code(204).send();
  });
}
