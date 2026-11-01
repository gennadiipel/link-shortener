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
        manager_code: link.managerCode,
        target_url: link.targetUrl,
      })
      .onConflict((conflict) => conflict.doNothing())
      .returning(["code", "target_url", "manager_code", "opens", "created_at"])
      .executeTakeFirst();

    if (!createdLink) {
      return undefined;
    }

    return {
      code: createdLink.code,
      createdAt: createdLink.created_at,
      managerCode: createdLink.manager_code ?? link.managerCode,
      opens: createdLink.opens,
      targetUrl: createdLink.target_url,
    };
  }

  async findByCode(code: string): Promise<Link | undefined> {
    const link = await this.database
      .selectFrom("links")
      .select(["code", "target_url", "manager_code", "opens", "created_at"])
      .where("code", "=", code)
      .executeTakeFirst();

    if (!link) {
      return undefined;
    }

    return {
      code: link.code,
      createdAt: link.created_at,
      managerCode: link.manager_code ?? "",
      opens: link.opens,
      targetUrl: link.target_url,
    };
  }
}
