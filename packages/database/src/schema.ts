import type { Generated } from "kysely";

export interface LinksTable {
  code: string;
  created_at: Generated<Date>;
  is_deleted: Generated<boolean>;
  manager_code: string | null;
  opens: Generated<string>;
  target_url: string;
}

export interface DatabaseSchema {
  links: LinksTable;
}
