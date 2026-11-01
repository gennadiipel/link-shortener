import { describe, expect, test } from "bun:test";
import {
  createLink,
  formatManagerCode,
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
      generateManagerCode: () => "ABCDEFGHJKMNPQRS",
      linkRepository: repositoryWith(async (record) => ({
        ...record,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        managerCode: record.managerCode,
        opens: 0,
      })),
    });

    expect(link).toEqual({
      code: "abc1234",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      managerCode: "ABCDEFGHJKMNPQRS",
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
      generateManagerCode: () => "ABCDEFGHJKMNPQRS",
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

  test("retries a manager code collision", async () => {
    const generatedManagerCodes = ["ABCDEFGHJKMNPQRS", "TUVWXYZ23456789A"];
    const attemptedManagerCodes: string[] = [];
    const link = await createLink("https://example.com", {
      generateCode: () => "abc1234",
      generateManagerCode: () =>
        generatedManagerCodes.shift() ?? "unused0000000000",
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
    expect(link.managerCode).toBe("TUVWXYZ23456789A");
  });

  test("fails after bounded code collisions", async () => {
    await expect(
      createLink("https://example.com", {
        generateCode: () => "abc1234",
        generateManagerCode: () => "ABCDEFGHJKMNPQRS",
        linkRepository: repositoryWith(async () => undefined),
      }),
    ).rejects.toBeInstanceOf(LinkCodeCollisionError);
  });

  test("formats a manager code into readable groups", () => {
    expect(formatManagerCode("ABCDEFGHJKMNPQRS")).toBe("ABCD-EFGH-JKMN-PQRS");
  });
});
