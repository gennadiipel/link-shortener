import type { Kysely } from "kysely";
import type { DatabaseSchema } from "../src/schema";

export async function up(database: Kysely<DatabaseSchema>): Promise<void> {
  await database.schema
    .alterTable("links")
    .alterColumn("opens", (column) => column.setDataType("bigint"))
    .execute();
}

export async function down(database: Kysely<DatabaseSchema>): Promise<void> {
  await database.schema
    .alterTable("links")
    .alterColumn("opens", (column) => column.setDataType("integer"))
    .execute();
}
