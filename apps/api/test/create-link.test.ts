import { afterAll, describe, expect, test } from "bun:test";
import type { CreateLinkRecord, LinkRepository } from "@lapinamk-ls/domain";
import { createApp } from "../src/app";
import { loadApiConfig } from "../src/config/env";

const createdRecords: CreateLinkRecord[] = [];
const linkRepository: LinkRepository = {
  create: async (record) => {
    createdRecords.push(record);

    return {
      ...record,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      opens: 0,
    };
  },
};
const app = createApp(
  loadApiConfig({
    API_PORT: "8000",
    APP_ENV: "development",
    CLIENT_ORIGIN: "http://localhost:3000",
    DATABASE_URL:
      "postgresql://link_shortener:link_shortener@localhost:5432/link_shortener",
    PUBLIC_BASE_URL: "http://localhost:8080",
    REDIS_URL: "redis://localhost:6379",
  }),
  { linkRepository },
);

afterAll(async () => {
  await app.close();
});

describe("POST /links", () => {
  test("creates a link and returns its URL and one-time manager secret", async () => {
    const response = await app.inject({
      body: { targetUrl: "https://example.com" },
      method: "POST",
      url: "/links",
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      shortUrl: expect.stringMatching(/^http:\/\/localhost:8080\/[a-z0-9]{7}$/),
      secretCode: expect.stringMatching(
        /^[A-HJ-KM-NP-Z2-9]{4}(-[A-HJ-KM-NP-Z2-9]{4}){3}$/,
      ),
    });
    expect(createdRecords.at(-1)).toMatchObject({
      managerCode: expect.stringMatching(/^[A-HJ-KM-NP-Z2-9]{16}$/),
      targetUrl: "https://example.com/",
    });
  });

  test("rejects a missing or invalid target URL", async () => {
    const missingTarget = await app.inject({
      body: {},
      method: "POST",
      url: "/links",
    });
    const invalidTarget = await app.inject({
      body: { targetUrl: "ftp://example.com" },
      method: "POST",
      url: "/links",
    });

    expect(missingTarget.statusCode).toBe(400);
    expect(invalidTarget.statusCode).toBe(400);
  });
});
