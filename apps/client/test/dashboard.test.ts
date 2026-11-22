import { describe, expect, test } from "bun:test";
import {
  DashboardAccessError,
  getDashboard,
} from "../src/features/links/api/get-dashboard";
import {
  dashboardLocation,
  parseShortLinkCode,
} from "../src/features/links/dashboard-location";

describe("dashboard navigation", () => {
  test("builds the same normalized location for creation and management", () => {
    expect(
      dashboardLocation(
        "https://short.example/abc1234",
        " abcd-efgh-jkmn-pqrs ",
      ),
    ).toEqual({
      to: "/dashboard/$code",
      params: { code: "abc1234" },
      search: { secretCode: "ABCD-EFGH-JKMN-PQRS" },
    });
    expect(parseShortLinkCode("http://localhost:8080/abc1234")).toBe("abc1234");
  });
  test.each([
    "",
    "example.com/abc1234",
    "https://example.com/not-valid",
    "ftp://example.com/abc1234",
    "/abc1234",
  ])("rejects invalid shortened URLs %j", (value) => {
    expect(parseShortLinkCode(value)).toBeUndefined();
  });
  test.each(["/api", "https://example.com/api/"])(
    "loads data using a credential query at %s",
    async (baseUrl) => {
      const payload = {
        shortUrl: "https://short.example/abc1234",
        targetUrl: "https://example.com/",
        opens: "9007199254740993",
      };
      expect(
        await getDashboard(baseUrl, "abc1234", "ABCDEFGHJKMNPQRS", {
          fetchRequest: async (url, init) => {
            expect(url).toBe(
              `${baseUrl.replace(/\/$/, "")}/links/abc1234/dashboard?secretCode=ABCDEFGHJKMNPQRS`,
            );
            expect(init.headers).toBeUndefined();
            expect(init.cache).toBe("no-store");
            return Response.json(payload);
          },
        }),
      ).toEqual(payload);
    },
  );
  test("distinguishes access rejection from server failures", async () => {
    await expect(
      getDashboard("/api", "abc1234", "secret", {
        fetchRequest: async () => new Response(null, { status: 404 }),
      }),
    ).rejects.toBeInstanceOf(DashboardAccessError);
    await expect(
      getDashboard("/api", "abc1234", "secret", {
        fetchRequest: async () => new Response(null, { status: 500 }),
      }),
    ).rejects.toThrow("Could not load the dashboard.");
  });
  test("does not accept incomplete dashboard data", async () => {
    await expect(
      getDashboard("/api", "abc1234", "secret", {
        fetchRequest: async () => Response.json({ opens: 12 }),
      }),
    ).rejects.toThrow();
  });
});
