import { describe, expect, test } from "bun:test";
import {
  createLink,
  InvalidTargetUrlError,
  LinkCodeCollisionError,
} from "../src/create-link";
import type { CreateLinkRecord, LinkRepository } from "../src/link";

function repositoryWith(
  create: (link: CreateLinkRecord) => ReturnType<LinkRepository["create"]>,
): LinkRepository {
  return { create };
}

describe("createLink", () => {
  test("creates a normalized HTTP link", async () => {
    const link = await createLink("https://example.com", {
      generateCode: () => "abc1234",
      linkRepository: repositoryWith(async (record) => ({
        ...record,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        opens: 0,
      })),
    });

    expect(link).toEqual({
      code: "abc1234",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      opens: 0,
      targetUrl: "https://example.com/",
    });
  });

  test("rejects a non-HTTP target URL", async () => {
    expect(
      createLink("ftp://example.com", {
        linkRepository: repositoryWith(async () => undefined),
      }),
    ).rejects.toBeInstanceOf(InvalidTargetUrlError);
  });

  test("retries a code collision", async () => {
    const generatedCodes = ["abc1234", "def5678"];
    const attemptedCodes: string[] = [];
    const link = await createLink("https://example.com", {
      generateCode: () => generatedCodes.shift() ?? "unused0",
      linkRepository: repositoryWith(async (record) => {
        attemptedCodes.push(record.code);
        return record.code === "abc1234"
          ? undefined
          : { ...record, createdAt: new Date(), opens: 0 };
      }),
    });

    expect(attemptedCodes).toEqual(["abc1234", "def5678"]);
    expect(link.code).toBe("def5678");
  });

  test("fails after bounded code collisions", async () => {
    await expect(
      createLink("https://example.com", {
        generateCode: () => "abc1234",
        linkRepository: repositoryWith(async () => undefined),
      }),
    ).rejects.toBeInstanceOf(LinkCodeCollisionError);
  });
});
