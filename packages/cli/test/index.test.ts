import { describe, expect, test } from "bun:test";
import { runCli } from "../src/index";

describe("runCli", () => {
  test("rejects an unknown command before connecting to the database", async () => {
    await expect(
      runCli(["unknown"], {
        databaseUrl: "postgresql://user:password@localhost:5432/test",
      }),
    ).rejects.toThrow("Usage: bun run cli link:create <target-url>");
  });
});
