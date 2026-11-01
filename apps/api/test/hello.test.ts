import { afterAll, describe, expect, test } from "bun:test";
import { loadApiConfig } from "../src/config/env";
import { createHttpApp } from "../src/http/app";

const linkRepository = {
  create: async () => undefined,
};
const linkCache = { set: async () => {} };

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

describe("GET /hello", () => {
  test("returns a greeting", async () => {
    const response = await app.inject({ method: "GET", url: "/hello" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ message: "Hello, world!" });
  });
});
