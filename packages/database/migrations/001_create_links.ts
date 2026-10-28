import { type Kysely, sql } from "kysely";
import type { DatabaseSchema } from "../src/schema";

export async function up(database: Kysely<DatabaseSchema>): Promise<void> {
  await database.schema
    .createTable("links")
    .addColumn("code", "varchar(7)", (column) => column.primaryKey())
    .addColumn("target_url", "text", (column) => column.notNull())
    .addColumn("opens", "integer", (column) => column.notNull().defaultTo(0))
    .addColumn("created_at", "timestamptz", (column) =>
      column.notNull().defaultTo(sql`now()`),
    )
    .execute();
}

export async function down(database: Kysely<DatabaseSchema>): Promise<void> {
  await database.schema.dropTable("links").execute();
}
