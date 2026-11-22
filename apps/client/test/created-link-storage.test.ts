import { describe, expect, test } from "bun:test";
import {
  createdLinkStorageKey,
  type StoredCreatedLink,
  saveCreatedLink,
} from "../src/features/links/storage/created-link";

const result: StoredCreatedLink = {
  targetUrl: "https://example.com/",
  shortUrl: "https://short.example/abc1234",
  secretCode: "ABCD-EFGH-JKMN-PQRS",
};

describe("created-link session storage", () => {
  test("stores the normalized target and the complete API result", () => {
    const values = new Map<string, string>();
    const storage = {
      setItem(key: string, value: string) {
        values.set(key, value);
      },
    };

    saveCreatedLink(result, storage);

    expect(values.size).toBe(1);
    expect(JSON.parse(values.get(createdLinkStorageKey) ?? "null")).toEqual(
      result,
    );

    const latest = { ...result, shortUrl: "https://short.example/def5678" };
    saveCreatedLink(latest, storage);

    expect(values.size).toBe(1);
    expect(JSON.parse(values.get(createdLinkStorageKey) ?? "null")).toEqual(
      latest,
    );
  });

  test("reports storage failures so navigation can wait for a retry", () => {
    const storage = {
      setItem() {
        throw new DOMException("Storage unavailable", "QuotaExceededError");
      },
    };

    expect(() => saveCreatedLink(result, storage)).toThrow(
      "Storage unavailable",
    );
    expect(result.secretCode).toBe("ABCD-EFGH-JKMN-PQRS");
  });
});
