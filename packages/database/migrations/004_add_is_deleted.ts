import type { Kysely } from "kysely";
import type { DatabaseSchema } from "../src/schema";

export async function up(database: Kysely<DatabaseSchema>): Promise<void> {
  await database.schema
    .alterTable("links")
    .addColumn("is_deleted", "boolean", (column) =>
      column.notNull().defaultTo(false),
    )
    .execute();
}

export async function down(database: Kysely<DatabaseSchema>): Promise<void> {
  await database.schema.alterTable("links").dropColumn("is_deleted").execute();
}
