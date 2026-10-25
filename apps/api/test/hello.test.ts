import { afterAll, describe, expect, test } from "bun:test";
import { createApp } from "../src/app";

const app = createApp();

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
