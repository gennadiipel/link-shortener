import { DashboardAccessError } from "./get-dashboard";

export async function deleteLink(
  baseUrl: string,
  code: string,
  secretCode: string,
  fetchRequest: (url: string, init: RequestInit) => Promise<Response> = fetch,
): Promise<void> {
  const response = await fetchRequest(
    `${baseUrl.replace(/\/+$/, "")}/links/${encodeURIComponent(code)}?${new URLSearchParams({ secretCode })}`,
    { method: "DELETE", cache: "no-store" },
  );
  if (response.status === 404) throw new DashboardAccessError();
  if (!response.ok)
    throw new Error("Could not finish deleting the link. Please try again.");
}
