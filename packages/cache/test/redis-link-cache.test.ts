import { describe, expect, test } from "bun:test";
import { RedisLinkCache } from "../src/redis-link-cache";

describe("RedisLinkCache", () => {
  test("writes the redirect target and zeroed opens counter", async () => {
    const calls: Array<[string, string]> = [];
    const cache = new RedisLinkCache({
      set: async (key, value) => {
        calls.push([key, value]);
      },
    });

    await cache.set({
      code: "abc1234",
      createdAt: new Date(),
      managerCode: "ABCDEFGHJKMNPQRS",
      opens: 0,
      targetUrl: "https://example.com/",
    });

    expect(calls).toEqual([
      ["url:abc1234", "https://example.com/"],
      ["opens:abc1234", "0"],
    ]);
  });
});
