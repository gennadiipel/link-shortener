export interface Link {
  code: string;
  createdAt: Date;
  managerCode: string;
  opens: number;
  targetUrl: string;
}

export interface CreateLinkRecord {
  code: string;
  managerCode: string;
  targetUrl: string;
}

export interface LinkRepository {
  create(link: CreateLinkRecord): Promise<Link | undefined>;
  findByCode(code: string): Promise<Link | undefined>;
}

export interface LinkCache {
  getTargetUrl(code: string): Promise<string | undefined>;
  incrementOpens(code: string): Promise<void>;
  repair(link: Link): Promise<void>;
  set(link: Link): Promise<void>;
}
