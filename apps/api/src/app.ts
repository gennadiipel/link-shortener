import cors from "@fastify/cors";
import {
  createLink,
  formatManagerCode,
  InvalidTargetUrlError,
  LinkCodeCollisionError,
  type LinkRepository,
} from "@lapinamk-ls/domain";
import Fastify from "fastify";
import { z } from "zod";
import type { ApiConfig } from "./config/env";

const createLinkBodySchema = z.object({ targetUrl: z.string() }).strict();

export interface AppDependencies {
  linkRepository: LinkRepository;
}

function createShortUrl(publicBaseUrl: string, code: string): string {
  const baseUrl = publicBaseUrl.endsWith("/")
    ? publicBaseUrl
    : `${publicBaseUrl}/`;

  return new URL(code, baseUrl).toString();
}

export function createApp(config: ApiConfig, dependencies: AppDependencies) {
  const app = Fastify({ logger: true });

  app.register(cors, {
    origin: config.CLIENT_ORIGIN,
  });

  app.get("/hello", async () => ({ message: "Hello, world!" }));

  app.post("/links", async (request, reply) => {
    const parsedBody = createLinkBodySchema.safeParse(request.body);

    if (!parsedBody.success) {
      return reply.code(400).send({ message: "targetUrl must be a string." });
    }

    try {
      const link = await createLink(parsedBody.data.targetUrl, {
        linkRepository: dependencies.linkRepository,
      });

      return reply.code(201).send({
        secretCode: formatManagerCode(link.managerCode),
        shortUrl: createShortUrl(config.PUBLIC_BASE_URL, link.code),
      });
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

  return app;
}
