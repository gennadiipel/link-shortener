import type {
  CreateLinkRecord,
  Link,
  LinkRepository,
} from "@lapinamk-ls/domain";
import type { Kysely } from "kysely";
import type { DatabaseSchema } from "./schema";

export class KyselyLinkRepository implements LinkRepository {
  constructor(private readonly database: Kysely<DatabaseSchema>) {}

  async create(link: CreateLinkRecord): Promise<Link | undefined> {
    const createdLink = await this.database
      .insertInto("links")
      .values({
        code: link.code,
        target_url: link.targetUrl,
      })
      .onConflict((conflict) => conflict.column("code").doNothing())
      .returning(["code", "target_url", "opens", "created_at"])
      .executeTakeFirst();

    if (!createdLink) {
      return undefined;
    }

    return {
      code: createdLink.code,
      createdAt: createdLink.created_at,
      opens: createdLink.opens,
      targetUrl: createdLink.target_url,
    };
  }
}
