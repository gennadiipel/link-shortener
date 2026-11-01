import { afterAll, describe, expect, test } from "bun:test";
import type { Link, LinkCache, LinkRepository } from "@lapinamk-ls/domain";
import { loadApiConfig } from "../src/config/env";
import { createHttpApp } from "../src/http/app";

const storedLink: Link = {
  code: "abc1234",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  managerCode: "ABCDEFGHJKMNPQRS",
  opens: 0,
  targetUrl: "https://example.com/",
};
let cacheFails = false;
let foundLink: Link | undefined = storedLink;
const repairedCodes: string[] = [];
const incrementedCodes: string[] = [];

const linkRepository: LinkRepository = {
  create: async () => undefined,
  findByCode: async () => foundLink,
};
const linkCache: LinkCache = {
  getTargetUrl: async () => undefined,
  incrementOpens: async (code) => {
    if (cacheFails) {
      throw new Error("Redis unavailable");
    }
    incrementedCodes.push(code);
  },
  repair: async (link) => {
    if (cacheFails) {
      throw new Error("Redis unavailable");
    }
    repairedCodes.push(link.code);
  },
  set: async () => {},
};
const app = createHttpApp(
  loadApiConfig({
    API_PORT: "8000",
    APP_ENV: "development",
    CLIENT_ORIGIN: "http://localhost:3000",
    DATABASE_URL:
      "postgresql://link_shortener:link_shortener@localhost:5432/link_shortener",
    PUBLIC_BASE_URL: "http://localhost:8080",
    REDIS_URL: "redis://localhost:6379",
  }),
  { linkCache, linkRepository },
);

afterAll(async () => {
  await app.close();
});

describe("GET /links/:code/redirect", () => {
  test("repairs cache and redirects a stored link", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/links/abc1234/redirect",
    });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("https://example.com/");
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(repairedCodes).toContain("abc1234");
    expect(incrementedCodes).toContain("abc1234");
  });

  test("returns 404 for an unknown code", async () => {
    foundLink = undefined;
    const response = await app.inject({
      method: "GET",
      url: "/links/missing0/redirect",
    });
    foundLink = storedLink;

    expect(response.statusCode).toBe(404);
    expect(response.headers["cache-control"]).toBe("no-store");
  });

  test("redirects when Redis repair fails", async () => {
    cacheFails = true;
    const response = await app.inject({
      method: "GET",
      url: "/links/abc1234/redirect",
    });
    cacheFails = false;

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("https://example.com/");
  });
});
