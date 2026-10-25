import { describe, expect, test } from "bun:test";
import { loadApiConfig } from "../src/config/env";

const validEnvironment = {
  API_PORT: "8000",
  APP_ENV: "development",
  CLIENT_ORIGIN: "http://localhost:3000",
  DATABASE_URL:
    "postgresql://link_shortener:link_shortener@localhost:5432/link_shortener",
  REDIS_URL: "redis://localhost:6379",
};

describe("API environment configuration", () => {
  test("parses valid development configuration", () => {
    expect(loadApiConfig(validEnvironment)).toMatchObject({
      API_PORT: 8000,
      APP_ENV: "development",
    });
  });

  test("parses valid production configuration", () => {
    expect(
      loadApiConfig({ ...validEnvironment, APP_ENV: "production" }).APP_ENV,
    ).toBe("production");
  });

  test("rejects a missing required value", () => {
    expect(() =>
      loadApiConfig({ ...validEnvironment, REDIS_URL: undefined }),
    ).toThrow("REDIS_URL");
  });

  test("rejects invalid URLs and ports", () => {
    expect(() => loadApiConfig({ ...validEnvironment, API_PORT: "0" })).toThrow(
      "API_PORT",
    );
    expect(() =>
      loadApiConfig({ ...validEnvironment, DATABASE_URL: "not-a-url" }),
    ).toThrow("DATABASE_URL");
  });
});
