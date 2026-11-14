import { describe, expect, test } from "bun:test";
import { RedisOpenCountReader } from "../src/redis-open-counts";

describe("RedisOpenCountReader", () => {
  test("scans cumulative counts in bounded batches", async () => {
    const scans: string[] = [];
    const reader = new RedisOpenCountReader({
      scan: async (cursor) => {
        scans.push(String(cursor));
        return cursor === "0"
          ? ["1", ["opens:abc1234", "opens:bad", "url:abc1234"]]
          : ["0", ["opens:def5678", "opens:abc1234"]];
      },
      mget: async (...keys) =>
        keys.map((key) => (key === "opens:abc1234" ? "2147483648" : "3")),
    });

    const batches = await Array.fromAsync(reader.batches());

    expect(scans).toEqual(["0", "1"]);
    expect(batches).toEqual([
      [{ code: "abc1234", opens: 2147483648n }],
      [
        { code: "def5678", opens: 3n },
        { code: "abc1234", opens: 2147483648n },
      ],
    ]);
  });

  test("skips missing or invalid counter values", async () => {
    const reader = new RedisOpenCountReader({
      scan: async () => ["0", ["opens:abc1234", "opens:def5678"]],
      mget: async () => [null, "broken"],
    });

    expect(await Array.fromAsync(reader.batches())).toEqual([]);
  });
});
