import type { Generated } from "kysely";

export interface LinksTable {
  code: string;
  created_at: Generated<Date>;
  opens: Generated<number>;
  target_url: string;
}

export interface DatabaseSchema {
  links: LinksTable;
}
