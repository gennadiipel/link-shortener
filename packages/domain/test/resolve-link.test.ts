import { describe, expect, test } from "bun:test";
import type { Link, LinkCache, LinkRepository } from "../src/link";
import { resolveLink } from "../src/resolve-link";

const link: Link = {
  code: "abc1234",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  managerCode: "ABCDEFGHJKMNPQRS",
  opens: 0,
  targetUrl: "https://example.com/",
};

function repositoryWith(foundLink: Link | undefined): LinkRepository {
  return {
    create: async () => undefined,
    findByCode: async () => foundLink,
  };
}

function cacheWith(overrides: Partial<LinkCache> = {}): LinkCache {
  return {
    getTargetUrl: async () => undefined,
    incrementOpens: async () => {},
    repair: async () => {},
    set: async () => {},
    ...overrides,
  };
}

describe("resolveLink", () => {
  test("repairs the cache, increments opens, and returns a stored link", async () => {
    const calls: string[] = [];
    const result = await resolveLink("abc1234", {
      linkCache: cacheWith({
        incrementOpens: async (code) => {
          calls.push(`increment:${code}`);
        },
        repair: async (storedLink) => {
          calls.push(`repair:${storedLink.code}`);
        },
      }),
      linkRepository: repositoryWith(link),
    });

    expect(result).toEqual({ cacheUpdated: true, link });
    expect(calls).toEqual(["repair:abc1234", "increment:abc1234"]);
  });

  test("returns no link without touching the cache", async () => {
    let cacheTouched = false;
    const result = await resolveLink("missing0", {
      linkCache: cacheWith({
        repair: async () => {
          cacheTouched = true;
        },
      }),
      linkRepository: repositoryWith(undefined),
    });

    expect(result).toEqual({ cacheUpdated: false, link: undefined });
    expect(cacheTouched).toBe(false);
  });

  test("returns a durable link when cache repair fails", async () => {
    const result = await resolveLink("abc1234", {
      linkCache: cacheWith({
        repair: async () => {
          throw new Error("Redis unavailable");
        },
      }),
      linkRepository: repositoryWith(link),
    });

    expect(result).toEqual({ cacheUpdated: false, link });
  });
});
