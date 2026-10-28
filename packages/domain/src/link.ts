export interface Link {
  code: string;
  createdAt: Date;
  opens: number;
  targetUrl: string;
}

export interface CreateLinkRecord {
  code: string;
  targetUrl: string;
}

export interface LinkRepository {
  create(link: CreateLinkRecord): Promise<Link | undefined>;
}
