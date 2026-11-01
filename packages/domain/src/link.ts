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
}
