import { describe, expect, test } from "bun:test";
import { runCli } from "../src/index";

describe("runCli", () => {
  const options = {
    databaseUrl: "postgresql://user:password@localhost:5432/test",
    redisUrl: "redis://localhost:6379",
  };

  test("rejects unknown commands and malformed arguments before connecting", async () => {
    for (const arguments_ of [
      ["unknown"],
      ["link:create"],
      ["link:delete", "bad"],
      ["link:soft-delete", "ABC1234"],
      ["cache:clear", "abc1234", "extra"],
    ]) {
      await expect(runCli(arguments_, options)).rejects.toThrow("Usage:");
    }
  });
});
