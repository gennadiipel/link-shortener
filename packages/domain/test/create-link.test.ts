import { describe, expect, test } from "bun:test";
import {
  createLink,
  formatManagerCode,
  InvalidTargetUrlError,
  LinkCodeCollisionError,
} from "../src/create-link";
import type { CreateLinkRecord, LinkCache, LinkRepository } from "../src/link";

function repositoryWith(
  create: (link: CreateLinkRecord) => ReturnType<LinkRepository["create"]>,
): LinkRepository {
  return { create };
}

function cacheWith(
  set: (link: Parameters<LinkCache["set"]>[0]) => Promise<void>,
): LinkCache {
  return { set };
}

describe("createLink", () => {
  test("creates a normalized HTTP link", async () => {
    const result = await createLink("https://example.com", {
      generateCode: () => "abc1234",
      generateManagerCode: () => "ABCDEFGHJKMNPQRS",
      linkCache: cacheWith(async () => {}),
      linkRepository: repositoryWith(async (record) => ({
        ...record,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        managerCode: record.managerCode,
        opens: 0,
      })),
    });

    expect(result).toEqual({
      cacheWritten: true,
      link: {
        code: "abc1234",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        managerCode: "ABCDEFGHJKMNPQRS",
        opens: 0,
        targetUrl: "https://example.com/",
      },
    });
  });

  test("rejects a non-HTTP target URL", async () => {
    expect(
      createLink("ftp://example.com", {
        linkCache: cacheWith(async () => {}),
        linkRepository: repositoryWith(async () => undefined),
      }),
    ).rejects.toBeInstanceOf(InvalidTargetUrlError);
  });

  test("retries a code collision", async () => {
    const generatedCodes = ["abc1234", "def5678"];
    const attemptedCodes: string[] = [];
    const result = await createLink("https://example.com", {
      generateCode: () => generatedCodes.shift() ?? "unused0",
      generateManagerCode: () => "ABCDEFGHJKMNPQRS",
      linkCache: cacheWith(async () => {}),
      linkRepository: repositoryWith(async (record) => {
        attemptedCodes.push(record.code);
        return record.code === "abc1234"
          ? undefined
          : { ...record, createdAt: new Date(), opens: 0 };
      }),
    });

    expect(attemptedCodes).toEqual(["abc1234", "def5678"]);
    expect(result.link.code).toBe("def5678");
  });

  test("retries a manager code collision", async () => {
    const generatedManagerCodes = ["ABCDEFGHJKMNPQRS", "TUVWXYZ23456789A"];
    const attemptedManagerCodes: string[] = [];
    const result = await createLink("https://example.com", {
      generateCode: () => "abc1234",
      generateManagerCode: () =>
        generatedManagerCodes.shift() ?? "unused0000000000",
      linkCache: cacheWith(async () => {}),
      linkRepository: repositoryWith(async (record) => {
        attemptedManagerCodes.push(record.managerCode);
        return record.managerCode === "ABCDEFGHJKMNPQRS"
          ? undefined
          : { ...record, createdAt: new Date(), opens: 0 };
      }),
    });

    expect(attemptedManagerCodes).toEqual([
      "ABCDEFGHJKMNPQRS",
      "TUVWXYZ23456789A",
    ]);
    expect(result.link.managerCode).toBe("TUVWXYZ23456789A");
  });

  test("fails after bounded code collisions", async () => {
    let cacheWrites = 0;

    await expect(
      createLink("https://example.com", {
        generateCode: () => "abc1234",
        generateManagerCode: () => "ABCDEFGHJKMNPQRS",
        linkCache: cacheWith(async () => {
          cacheWrites += 1;
        }),
        linkRepository: repositoryWith(async () => undefined),
      }),
    ).rejects.toBeInstanceOf(LinkCodeCollisionError);

    expect(cacheWrites).toBe(0);
  });

  test("keeps a durable link when cache population fails", async () => {
    const result = await createLink("https://example.com", {
      generateCode: () => "abc1234",
      generateManagerCode: () => "ABCDEFGHJKMNPQRS",
      linkCache: cacheWith(async () => {
        throw new Error("Redis unavailable");
      }),
      linkRepository: repositoryWith(async (record) => ({
        ...record,
        createdAt: new Date(),
        opens: 0,
      })),
    });

    expect(result.cacheWritten).toBe(false);
    expect(result.link.code).toBe("abc1234");
  });

  test("formats a manager code into readable groups", () => {
    expect(formatManagerCode("ABCDEFGHJKMNPQRS")).toBe("ABCD-EFGH-JKMN-PQRS");
  });
});
