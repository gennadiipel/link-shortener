import { describe, expect, test } from "bun:test";
import {
  CreateLinkError,
  createShortLink,
} from "../src/features/links/api/create-link";

const createdLink = {
  shortUrl: "https://short.example/abc1234",
  secretCode: "ABCD-EFGH-JKMN-PQRS",
};

describe("createShortLink", () => {
  test.each([
    ["/api", "/api/links"],
    ["http://localhost:8000", "http://localhost:8000/links"],
    ["http://localhost:8000/", "http://localhost:8000/links"],
    ["https://short.example/api/", "https://short.example/api/links"],
  ])("posts to the configured API base %s", async (baseUrl, expectedUrl) => {
    const requests: { url: string; init: RequestInit }[] = [];
    const fetchRequest = async (url: string, init: RequestInit) => {
      requests.push({ url, init });
      return Response.json(createdLink, { status: 201 });
    };

    expect(
      await createShortLink(baseUrl, "https://example.com/", fetchRequest),
    ).toEqual(createdLink);
    expect(requests).toEqual([
      {
        url: expectedUrl,
        init: {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetUrl: "https://example.com/" }),
        },
      },
    ]);
  });

  test("maps a rejected URL to a recoverable error", async () => {
    const fetchRequest = async () =>
      Response.json({ message: "Rejected" }, { status: 400 });

    await expect(
      createShortLink("/api", "https://example.com/", fetchRequest),
    ).rejects.toThrow(
      "The service could not accept this URL. Check it and try again.",
    );
  });

  test("does not retry a failed creation or expose server details", async () => {
    let requests = 0;
    const fetchRequest = async () => {
      requests += 1;
      return Response.json(
        { message: "Internal database details" },
        { status: 500 },
      );
    };

    await expect(
      createShortLink("/api", "https://example.com/", fetchRequest),
    ).rejects.toThrow("Could not shorten the link. Please try again.");
    expect(requests).toBe(1);
  });

  test("maps a network failure without retrying", async () => {
    let requests = 0;
    const fetchRequest = async () => {
      requests += 1;
      throw new TypeError("Failed to fetch");
    };

    await expect(
      createShortLink("/api", "https://example.com/", fetchRequest),
    ).rejects.toThrow("Could not reach the link service. Please try again.");
    expect(requests).toBe(1);
  });

  test.each([
    null,
    {},
    { shortUrl: createdLink.shortUrl },
    { ...createdLink, shortUrl: "not a URL" },
    { ...createdLink, secretCode: "" },
  ])("rejects an invalid success payload %j", async (payload) => {
    const fetchRequest = async () => Response.json(payload, { status: 201 });

    await expect(
      createShortLink("/api", "https://example.com/", fetchRequest),
    ).rejects.toThrow(
      "The service returned an invalid response. Please try again.",
    );
  });

  test("rejects a non-JSON success response", async () => {
    const fetchRequest = async () => new Response("not JSON", { status: 201 });

    await expect(
      createShortLink("/api", "https://example.com/", fetchRequest),
    ).rejects.toBeInstanceOf(CreateLinkError);
    await expect(
      createShortLink("/api", "https://example.com/", fetchRequest),
    ).rejects.toThrow(
      "The service returned an invalid response. Please try again.",
    );
  });

  test("only returns the fields in the creation contract", async () => {
    const fetchRequest = async () =>
      Response.json(
        { ...createdLink, internalId: "not-for-the-client" },
        { status: 201 },
      );

    expect(
      await createShortLink("/api", "https://example.com/", fetchRequest),
    ).toEqual(createdLink);
  });
});
