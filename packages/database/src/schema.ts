import type { Generated } from "kysely";

export interface LinksTable {
  code: string;
  created_at: Generated<Date>;
  manager_code: string | null;
  opens: Generated<number>;
  target_url: string;
}

export interface DatabaseSchema {
  links: LinksTable;
}
