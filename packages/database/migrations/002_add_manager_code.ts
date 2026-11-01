import { type Kysely, sql } from "kysely";
import type { DatabaseSchema } from "../src/schema";

export async function up(database: Kysely<DatabaseSchema>): Promise<void> {
  await database.schema
    .alterTable("links")
    .addColumn("manager_code", "varchar(16)")
    .execute();

  await sql`
    CREATE UNIQUE INDEX links_manager_code_unique
    ON links (manager_code)
    WHERE manager_code IS NOT NULL
  `.execute(database);
}

export async function down(database: Kysely<DatabaseSchema>): Promise<void> {
  await sql`DROP INDEX links_manager_code_unique`.execute(database);
  await database.schema
    .alterTable("links")
    .dropColumn("manager_code")
    .execute();
}
