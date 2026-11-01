import { describe, expect, test } from "bun:test";
import { RedisLinkCache } from "../src/redis-link-cache";

describe("RedisLinkCache", () => {
  test("writes the redirect target and zeroed opens counter", async () => {
    const calls: Array<[string, string]> = [];
    const cache = new RedisLinkCache({
      get: async () => null,
      incr: async () => 1,
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

  test("reads, repairs, and increments link cache keys", async () => {
    const calls: string[] = [];
    const cache = new RedisLinkCache({
      get: async (key) => {
        calls.push(`get:${key}`);
        return "https://example.com/";
      },
      incr: async (key) => {
        calls.push(`incr:${key}`);
        return 1;
      },
      set: async (key, value, ...options) => {
        calls.push(`set:${key}:${value}:${options.join(",")}`);
      },
    });
    const link = {
      code: "abc1234",
      createdAt: new Date(),
      managerCode: "ABCDEFGHJKMNPQRS",
      opens: 0,
      targetUrl: "https://example.com/",
    };

    await expect(cache.getTargetUrl(link.code)).resolves.toBe(link.targetUrl);
    await cache.repair(link);
    await cache.incrementOpens(link.code);

    expect(calls).toEqual([
      "get:url:abc1234",
      "set:url:abc1234:https://example.com/:",
      "set:opens:abc1234:0:NX",
      "incr:opens:abc1234",
    ]);
  });
});
