import { type Kysely, sql } from "kysely";
import type { DatabaseSchema } from "./schema";

interface OpenCountSnapshot {
  code: string;
  opens: bigint;
}

export class KyselyOpenCountRepository {
  constructor(private readonly database: Kysely<DatabaseSchema>) {}

  async sync(snapshots: OpenCountSnapshot[]): Promise<void> {
    if (snapshots.length === 0) return;

    const values = sql.join(
      snapshots.map(
        ({ code, opens }) => sql`(${code}, ${opens.toString()}::bigint)`,
      ),
    );

    await sql`
      UPDATE links AS link
      SET opens = GREATEST(link.opens, snapshot.opens)
      FROM (VALUES ${values}) AS snapshot(code, opens)
      WHERE link.code = snapshot.code
    `.execute(this.database);
  }
}
