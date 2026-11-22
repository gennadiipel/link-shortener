import { afterAll, describe, expect, test } from "bun:test";
import type { Link } from "@lapinamk-ls/domain";
import { loadApiConfig } from "../src/config/env";
import { createHttpApp } from "../src/http/app";

const link: Link = {
  code: "abc1234",
  managerCode: "ABCDEFGHJKMNPQRS",
  targetUrl: "https://example.com/private-target",
  opens: 9007199254740993n,
  createdAt: new Date(),
};
const app = createHttpApp(
  loadApiConfig({
    API_PORT: "8000",
    APP_ENV: "development",
    CLIENT_ORIGIN: "http://localhost:3000",
    DATABASE_URL: "postgresql://user:pass@localhost/db",
    PUBLIC_BASE_URL: "http://localhost:8080",
    REDIS_URL: "redis://localhost:6379",
  }),
  {
    linkRepository: {
      create: async () => undefined,
      findByCode: async (code) => {
        if (code === "outage0") throw new Error("Database unavailable");
        return code === link.code ? link : undefined;
      },
    },
    linkCache: {
      getTargetUrl: async () => {
        throw new Error("Dashboard must not use Redis");
      },
      incrementOpens: async () => {
        throw new Error("Dashboard must not count as a click");
      },
      repair: async () => {
        throw new Error("Dashboard must not repair Redis");
      },
      set: async () => {
        throw new Error("Dashboard must not write Redis");
      },
    },
  },
);
afterAll(() => app.close());

describe("GET /links/:code/dashboard", () => {
  test("returns authorized Postgres data, exact bigint counts, and no secret", async () => {
    const response = await app.inject({
      url: "/links/abc1234/dashboard?secretCode=abcd-efgh-jkmn-pqrs",
    });
    expect(response.statusCode).toBe(200);
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(response.json()).toEqual({
      shortUrl: "http://localhost:8080/abc1234",
      targetUrl: link.targetUrl,
      opens: "9007199254740993",
    });
    expect(link.opens).toBe(9007199254740993n);
  });
  test.each([
    ["abc1234", "TUVW-XYZ2-3456-789A"],
    ["missing", "ABCD-EFGH-JKMN-PQRS"],
    ["deleted", "ABCD-EFGH-JKMN-PQRS"],
    ["bad", "ABCD-EFGH-JKMN-PQRS"],
    ["abc1234", "invalid"],
    ["abc1234", "ABCD-EFGH-JKMN-PQRS&secretCode=invalid"],
    ["abc1234", ""],
  ])("does not reveal data for invalid access %s", async (code, secretCode) => {
    const response = await app.inject({
      url: `/links/${code}/dashboard${secretCode ? `?secretCode=${secretCode}` : ""}`,
    });
    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ message: "Link not found." });
    expect(response.headers["cache-control"]).toBe("no-store");
  });
  test("keeps outages distinguishable from denied access", async () => {
    const response = await app.inject({
      url: "/links/outage0/dashboard?secretCode=ABCD-EFGH-JKMN-PQRS",
    });
    expect(response.statusCode).toBe(500);
  });
});
