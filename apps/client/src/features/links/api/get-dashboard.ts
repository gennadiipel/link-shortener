import { z } from "zod";

const dashboardSchema = z.object({
  shortUrl: z.url(),
  targetUrl: z.url(),
  opens: z.string().regex(/^\d+$/),
});
export type LinkDashboard = z.infer<typeof dashboardSchema>;

export class DashboardAccessError extends Error {
  constructor() {
    super("Link not found.");
    this.name = "DashboardAccessError";
  }
}

export async function getDashboard(
  baseUrl: string,
  code: string,
  secretCode: string,
  options: {
    signal?: AbortSignal;
    fetchRequest?: (url: string, init: RequestInit) => Promise<Response>;
  } = {},
): Promise<LinkDashboard> {
  const response = await (options.fetchRequest ?? fetch)(
    `${baseUrl.replace(/\/+$/, "")}/links/${encodeURIComponent(code)}/dashboard?${new URLSearchParams({ secretCode })}`,
    {
      cache: "no-store",
      signal: options.signal,
    },
  );
  if (response.status === 404) throw new DashboardAccessError();
  if (!response.ok) throw new Error("Could not load the dashboard.");
  return dashboardSchema.parse(await response.json());
}
