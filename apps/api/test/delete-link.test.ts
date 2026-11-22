import { afterAll, beforeEach, describe, expect, test } from "bun:test";
import type { Link } from "@lapinamk-ls/domain";
import { loadApiConfig } from "../src/config/env";
import { createHttpApp } from "../src/http/app";

let link: Link;
let cleared = false;
let failClear = false;
const credentials = "secretCode=ABCD-EFGH-JKMN-PQRS";
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
      findByCode: async (code, options) =>
        code === link.code && (!link.isDeleted || options?.includeDeleted)
          ? link
          : undefined,
      softDelete: async (_code, count) => {
        link.isDeleted = true;
        if (count !== undefined && count > link.opens) link.opens = count;
        return true;
      },
    },
    linkCache: {
      getTargetUrl: async () => (cleared ? undefined : link.targetUrl),
      getOpens: async () => (cleared ? undefined : 30n),
      incrementOpens: async () => {},
      repair: async () => {},
      set: async () => {},
      clear: async () => {
        if (failClear) throw new Error("Redis unavailable");
        cleared = true;
      },
    },
  },
);
beforeEach(() => {
  link = {
    code: "abc1234",
    managerCode: "ABCDEFGHJKMNPQRS",
    targetUrl: "https://example.com/",
    createdAt: new Date(),
    opens: 10n,
    isDeleted: false,
  };
  cleared = false;
  failClear = false;
});
afterAll(() => app.close());

describe("DELETE /links/:code", () => {
  test("retains the row and dashboard, clears the redirect, and is retryable", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: `/links/abc1234?${credentials}`,
    });
    expect(response.statusCode).toBe(204);
    expect(response.body).toBe("");
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(link.isDeleted).toBe(true);
    expect(link.opens).toBe(30n);
    expect(cleared).toBe(true);
    const dashboard = await app.inject({
      url: `/links/abc1234/dashboard?${credentials}`,
    });
    expect(dashboard.statusCode).toBe(200);
    expect(dashboard.json()).toEqual({
      shortUrl: "http://localhost:8080/abc1234",
      targetUrl: link.targetUrl,
      opens: "30",
      isDeleted: true,
    });
    expect(
      (await app.inject({ url: "/links/abc1234/redirect" })).statusCode,
    ).toBe(404);
    expect(
      (
        await app.inject({
          method: "DELETE",
          url: `/links/abc1234?${credentials}`,
        })
      ).statusCode,
    ).toBe(204);
  });
  test.each([
    `/links/missing?${credentials}`,
    "/links/abc1234",
    "/links/abc1234?secretCode=invalid",
    "/links/abc1234?secretCode=TUVW-XYZ2-3456-789A",
  ])("rejects invalid access without deletion %s", async (url) => {
    const response = await app.inject({ method: "DELETE", url });
    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ message: "Link not found." });
    expect(link.isDeleted).toBe(false);
    expect(cleared).toBe(false);
  });
  test("allows an authenticated cleanup retry after Redis failed", async () => {
    failClear = true;
    expect(
      (
        await app.inject({
          method: "DELETE",
          url: `/links/abc1234?${credentials}`,
        })
      ).statusCode,
    ).toBe(500);
    expect(link.isDeleted).toBe(true);
    expect(cleared).toBe(false);
    failClear = false;
    expect(
      (
        await app.inject({
          method: "DELETE",
          url: `/links/abc1234?${credentials}`,
        })
      ).statusCode,
    ).toBe(204);
    expect(cleared).toBe(true);
  });
  test("permits cross-origin browser DELETE requests", async () => {
    const response = await app.inject({
      method: "OPTIONS",
      url: "/links/abc1234",
      headers: {
        origin: "http://localhost:3000",
        "access-control-request-method": "DELETE",
      },
    });
    expect(response.statusCode).toBe(204);
    expect(response.headers["access-control-allow-methods"]).toContain(
      "DELETE",
    );
  });
});
