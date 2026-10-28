import { describe, expect, test } from "bun:test";
import { createDatabase } from "../src/database";

describe("createDatabase", () => {
  test("creates a Kysely instance without connecting eagerly", async () => {
    const database = createDatabase(
      "postgresql://user:password@localhost:5432/test",
    );

    expect(database).toBeDefined();

    await database.destroy();
  });
});
