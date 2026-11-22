import { describe, expect, test } from "bun:test";
import {
  type Link,
  type LinkCache,
  type LinkRepository,
  softDeleteManagedLink,
} from "../src/index";

function fixture() {
  const link: Link = {
    code: "abc1234",
    managerCode: "ABCDEFGHJKMNPQRS",
    targetUrl: "https://example.com/",
    createdAt: new Date(),
    opens: 10n,
    isDeleted: false,
  };
  const calls: string[] = [];
  const failures = { read: false, write: false, clear: false };
  let cachedOpens: bigint | undefined = 20n;
  const linkRepository: LinkRepository = {
    create: async () => undefined,
    findByCode: async (code, options) => {
      expect(options?.includeDeleted).toBe(true);
      return code === link.code ? link : undefined;
    },
    softDelete: async (_code, count) => {
      calls.push("write");
      if (failures.write) throw new Error("Database unavailable");
      link.isDeleted = true;
      if (count !== undefined && count > link.opens) link.opens = count;
      return true;
    },
  };
  const linkCache: LinkCache = {
    getTargetUrl: async () => undefined,
    incrementOpens: async () => {},
    repair: async () => {},
    set: async () => {},
    getOpens: async () => {
      calls.push("read");
      if (failures.read) throw new Error("Count unavailable");
      return cachedOpens;
    },
    clear: async () => {
      calls.push("clear");
      if (failures.clear) throw new Error("Purge unavailable");
      cachedOpens = undefined;
    },
  };
  return {
    link,
    calls,
    failures,
    dependencies: { linkRepository, linkCache },
    setCount: (value: bigint | undefined) => {
      cachedOpens = value;
    },
  };
}

describe("softDeleteManagedLink", () => {
  test.each([20n, 5n, undefined])(
    "retains the row and preserves the greater count %s",
    async (count) => {
      const f = fixture();
      f.setCount(count);
      expect(
        await softDeleteManagedLink(
          f.link.code,
          "abcd-efgh-jkmn-pqrs",
          f.dependencies,
        ),
      ).toBe(true);
      expect(f.link.isDeleted).toBe(true);
      expect(f.link.opens).toBe(count === 20n ? 20n : 10n);
      expect(f.calls).toEqual(["read", "write", "clear"]);
    },
  );
  test("never mutates a missing link or invalid credential", async () => {
    const f = fixture();
    expect(
      await softDeleteManagedLink(
        "missing",
        f.link.managerCode,
        f.dependencies,
      ),
    ).toBe(false);
    expect(
      await softDeleteManagedLink(
        f.link.code,
        "TUVWXYZ23456789A",
        f.dependencies,
      ),
    ).toBe(false);
    expect(f.calls).toEqual([]);
    expect(f.link.isDeleted).toBe(false);
  });
  test("does not mark a row deleted when the counter read fails", async () => {
    const f = fixture();
    f.failures.read = true;
    await expect(
      softDeleteManagedLink(f.link.code, f.link.managerCode, f.dependencies),
    ).rejects.toThrow("Count unavailable");
    expect(f.calls).toEqual(["read"]);
    expect(f.link.isDeleted).toBe(false);
  });
  test("does not purge cache when the database write fails", async () => {
    const f = fixture();
    f.failures.write = true;
    await expect(
      softDeleteManagedLink(f.link.code, f.link.managerCode, f.dependencies),
    ).rejects.toThrow("Database unavailable");
    expect(f.calls).toEqual(["read", "write"]);
    expect(f.link.isDeleted).toBe(false);
  });
  test("can retry cleanup after the row has already been soft-deleted", async () => {
    const f = fixture();
    f.failures.clear = true;
    await expect(
      softDeleteManagedLink(f.link.code, f.link.managerCode, f.dependencies),
    ).rejects.toThrow("Purge unavailable");
    expect(f.link.isDeleted).toBe(true);
    f.failures.clear = false;
    expect(
      await softDeleteManagedLink(
        f.link.code,
        f.link.managerCode,
        f.dependencies,
      ),
    ).toBe(true);
    expect(f.link.opens).toBe(20n);
    expect(
      await softDeleteManagedLink(
        f.link.code,
        f.link.managerCode,
        f.dependencies,
      ),
    ).toBe(true);
  });
});
