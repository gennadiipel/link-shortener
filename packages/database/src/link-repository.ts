import type {
  CreateLinkRecord,
  Link,
  LinkRepository,
} from "@lapinamk-ls/domain";
import { type Kysely, sql } from "kysely";
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
      .returning([
        "code",
        "target_url",
        "manager_code",
        "opens",
        "created_at",
        "is_deleted",
      ])
      .executeTakeFirst();

    if (!createdLink) {
      return undefined;
    }

    return {
      code: createdLink.code,
      createdAt: createdLink.created_at,
      managerCode: createdLink.manager_code ?? link.managerCode,
      opens: BigInt(createdLink.opens),
      targetUrl: createdLink.target_url,
      isDeleted: createdLink.is_deleted,
    };
  }

  async findByCode(
    code: string,
    options: { includeDeleted?: boolean } = {},
  ): Promise<Link | undefined> {
    let query = this.database
      .selectFrom("links")
      .select([
        "code",
        "target_url",
        "manager_code",
        "opens",
        "created_at",
        "is_deleted",
      ])
      .where("code", "=", code);
    if (!options.includeDeleted) query = query.where("is_deleted", "=", false);
    const link = await query.executeTakeFirst();

    if (!link) {
      return undefined;
    }

    return {
      code: link.code,
      createdAt: link.created_at,
      managerCode: link.manager_code ?? "",
      opens: BigInt(link.opens),
      targetUrl: link.target_url,
      isDeleted: link.is_deleted,
    };
  }

  async hardDelete(code: string): Promise<boolean> {
    const deleted = await this.database
      .deleteFrom("links")
      .where("code", "=", code)
      .returning("code")
      .executeTakeFirst();

    return deleted !== undefined;
  }

  async softDelete(code: string, cachedOpens?: bigint): Promise<boolean> {
    const updates =
      cachedOpens === undefined
        ? { is_deleted: true }
        : {
            is_deleted: true,
            opens: sql<string>`GREATEST(opens, ${cachedOpens.toString()}::bigint)`,
          };
    const updated = await this.database
      .updateTable("links")
      .set(updates)
      .where("code", "=", code)
      .returning("code")
      .executeTakeFirst();

    return updated !== undefined;
  }
}
