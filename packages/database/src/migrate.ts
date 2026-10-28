import { promises as fs } from "node:fs";
import * as path from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  FileMigrationProvider,
  Kysely,
  Migrator,
  PostgresDialect,
} from "kysely";
import { Pool } from "pg";
import type { DatabaseSchema } from "./schema";

const migrationsDirectory = path.resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../migrations",
);

export async function migrateDatabase(databaseUrl: string): Promise<void> {
  const database = new Kysely<DatabaseSchema>({
    dialect: new PostgresDialect({
      pool: new Pool({ connectionString: databaseUrl }),
    }),
  });
  const migrator = new Migrator({
    db: database,
    provider: new FileMigrationProvider({
      fs,
      migrationFolder: migrationsDirectory,
      path,
    }),
  });

  try {
    const { error, results } = await migrator.migrateToLatest();

    for (const result of results ?? []) {
      console.log(`${result.status}: ${result.migrationName}`);
    }

    if (error) {
      throw error;
    }
  } finally {
    await database.destroy();
  }
}
