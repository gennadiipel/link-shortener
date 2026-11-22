import { describe, expect, test } from "bun:test";
import { deleteLink } from "../src/features/links/api/delete-link";
import { DashboardAccessError } from "../src/features/links/api/get-dashboard";
import {
  createdLinkStorageKey,
  removeCreatedLink,
} from "../src/features/links/storage/created-link";

describe("delete link", () => {
  test.each(["/api", "http://localhost:8000/"])(
    "sends one credential-checked DELETE at %s",
    async (baseUrl) => {
      let requests = 0;
      await deleteLink(
        baseUrl,
        "abc1234",
        "ABCD-EFGH-JKMN-PQRS",
        async (url, init) => {
          requests += 1;
          expect(url).toBe(
            `${baseUrl.replace(/\/$/, "")}/links/abc1234?secretCode=ABCD-EFGH-JKMN-PQRS`,
          );
          expect(init).toEqual({ method: "DELETE", cache: "no-store" });
          return new Response(null, { status: 204 });
        },
      );
      expect(requests).toBe(1);
    },
  );
  test("distinguishes invalid access from retryable failures", async () => {
    await expect(
      deleteLink(
        "/api",
        "abc1234",
        "secret",
        async () => new Response(null, { status: 404 }),
      ),
    ).rejects.toBeInstanceOf(DashboardAccessError);
    await expect(
      deleteLink(
        "/api",
        "abc1234",
        "secret",
        async () => new Response(null, { status: 500 }),
      ),
    ).rejects.toThrow("Could not finish deleting the link.");
  });
  test("only removes the saved result for the deleted link", () => {
    let saved: string | null = JSON.stringify({
      shortUrl: "https://short.example/abc1234",
    });
    const storage = {
      getItem: (key: string) => {
        expect(key).toBe(createdLinkStorageKey);
        return saved;
      },
      removeItem: (key: string) => {
        expect(key).toBe(createdLinkStorageKey);
        saved = null;
      },
    };
    removeCreatedLink("https://short.example/def5678", storage);
    expect(saved).not.toBeNull();
    removeCreatedLink("https://short.example/abc1234", storage);
    expect(saved).toBeNull();
  });
});
