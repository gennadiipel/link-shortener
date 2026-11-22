import { describe, expect, test } from "bun:test";
import {
  getManagedLink,
  type Link,
  type LinkRepository,
  normalizeManagerCode,
} from "../src/index";

const link: Link = {
  code: "abc1234",
  managerCode: "ABCDEFGHJKMNPQRS",
  targetUrl: "https://example.com/",
  opens: 9007199254740993n,
  isDeleted: false,
  createdAt: new Date(),
};
function repository(value: Link | undefined): LinkRepository {
  return {
    softDelete: async () => false,
    create: async () => undefined,
    findByCode: async () => value,
  };
}

describe("managed link access", () => {
  test("can authorize a deleted row for a read-only dashboard", async () => {
    const deleted = { ...link, isDeleted: true };
    const linkRepository = repository(deleted);
    linkRepository.findByCode = async (_code, options) =>
      options?.includeDeleted ? deleted : undefined;
    expect(
      await getManagedLink(link.code, link.managerCode, { linkRepository }),
    ).toBe(deleted);
  });
  test("accepts formatted or unformatted credentials after normalization", async () => {
    expect(normalizeManagerCode("  abcd-efgh-jkmn-pqrs ")).toBe(
      link.managerCode,
    );
    expect(
      await getManagedLink(link.code, "abcd-efgh-jkmn-pqrs", {
        linkRepository: repository(link),
      }),
    ).toBe(link);
  });
  test("rejects a wrong credential for an existing link", async () => {
    expect(
      await getManagedLink(link.code, "TUVW-XYZ2-3456-789A", {
        linkRepository: repository(link),
      }),
    ).toBeUndefined();
  });
  test("rejects absent links", async () => {
    expect(
      await getManagedLink(link.code, link.managerCode, {
        linkRepository: repository(undefined),
      }),
    ).toBeUndefined();
  });
  test("rejects legacy links with no manager code", async () => {
    expect(
      await getManagedLink(link.code, link.managerCode, {
        linkRepository: repository({ ...link, managerCode: "" }),
      }),
    ).toBeUndefined();
  });
  test("does not read storage for malformed credentials", async () => {
    const linkRepository: LinkRepository = {
      softDelete: async () => false,
      create: async () => undefined,
      findByCode: async () => {
        throw new Error("Unexpected database access");
      },
    };
    expect(
      await getManagedLink("bad", link.managerCode, { linkRepository }),
    ).toBeUndefined();
    expect(
      await getManagedLink(link.code, "", { linkRepository }),
    ).toBeUndefined();
    expect(
      await getManagedLink(link.code, "ABCD-EFGH-JK!N-PQRS", {
        linkRepository,
      }),
    ).toBeUndefined();
  });
  test("propagates database outages instead of treating them as invalid access", async () => {
    const linkRepository: LinkRepository = {
      softDelete: async () => false,
      create: async () => undefined,
      findByCode: async () => {
        throw new Error("Database unavailable");
      },
    };
    await expect(
      getManagedLink(link.code, link.managerCode, { linkRepository }),
    ).rejects.toThrow("Database unavailable");
  });
});
