import { useNavigate, useRouter } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { clientEnv } from "../../config/env";
import { deleteLink } from "./api/delete-link";
import { DashboardAccessError } from "./api/get-dashboard";
import { parseShortLinkCode } from "./dashboard-location";
import { removeCreatedLink } from "./storage/created-link";

export function useDeleteLink(
  shortUrl: string,
  editCode: string,
  isDeleted: boolean,
) {
  const router = useRouter();
  const navigate = useNavigate();
  const inFlight = useRef(false);
  const [isPending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    if (inFlight.current || isDeleted) return;
    if (
      !window.confirm(
        "Delete this shortened link? It may continue redirecting for up to 60 seconds.",
      )
    )
      return;
    inFlight.current = true;
    setPending(true);
    setError(null);
    try {
      const code = parseShortLinkCode(shortUrl);
      if (!code) throw new DashboardAccessError();
      await deleteLink(clientEnv.VITE_API_URL, code, editCode);
      try {
        removeCreatedLink(shortUrl);
      } catch {
        /* Storage cleanup must not block the deleted dashboard. */
      }
      await router.invalidate();
    } catch (error) {
      if (error instanceof DashboardAccessError)
        await navigate({ to: "/", replace: true });
      else setError("Could not finish deleting the link. Please try again.");
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  return { isPending, error, remove };
}
