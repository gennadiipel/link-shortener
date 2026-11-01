import {
  createLink,
  InvalidTargetUrlError,
  LinkCodeCollisionError,
} from "@lapinamk-ls/domain";
import type { FastifyInstance } from "fastify";
import type { ApiConfig } from "../../../config/env";
import type { HttpDependencies } from "../../types";
import { presentCreatedLink } from "./presenter";
import { createLinkBodySchema } from "./schema";

export function registerCreateLinkRoute(
  app: FastifyInstance,
  config: ApiConfig,
  dependencies: HttpDependencies,
): void {
  app.post("/links", async (request, reply) => {
    const parsedBody = createLinkBodySchema.safeParse(request.body);

    if (!parsedBody.success) {
      return reply.code(400).send({ message: "targetUrl must be a string." });
    }

    try {
      const result = await createLink(parsedBody.data.targetUrl, dependencies);

      if (!result.cacheWritten) {
        request.log.warn(
          { code: result.link.code },
          "Link created but Redis cache population failed.",
        );
      }

      return reply
        .code(201)
        .send(presentCreatedLink(config.PUBLIC_BASE_URL, result.link));
    } catch (error) {
      if (error instanceof InvalidTargetUrlError) {
        return reply.code(400).send({ message: error.message });
      }

      if (error instanceof LinkCodeCollisionError) {
        return reply.code(500).send({ message: "Could not create link." });
      }

      throw error;
    }
  });
}
