export interface Link {
  code: string;
  createdAt: Date;
  managerCode: string;
  opens: bigint;
  targetUrl: string;
  isDeleted: boolean;
}

export interface CreateLinkRecord {
  code: string;
  managerCode: string;
  targetUrl: string;
}

export interface LinkRepository {
  create(link: CreateLinkRecord): Promise<Link | undefined>;
  findByCode(
    code: string,
    options?: { includeDeleted?: boolean },
  ): Promise<Link | undefined>;
  softDelete(code: string, cachedOpens?: bigint): Promise<boolean>;
}

export interface LinkCache {
  getTargetUrl(code: string): Promise<string | undefined>;
  incrementOpens(code: string): Promise<void>;
  repair(link: Link): Promise<void>;
  set(link: Link): Promise<void>;
  getOpens(code: string): Promise<bigint | undefined>;
  clear(code: string): Promise<void>;
}
