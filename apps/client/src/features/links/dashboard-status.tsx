import { useRouter } from "@tanstack/react-router";
import { PageLayout } from "../../components/page-layout";
import { Button } from "../../components/ui/button";

export function DashboardPending() {
  return (
    <PageLayout>
      <p role="status" className="text-sm text-muted">
        Loading your dashboard…
      </p>
    </PageLayout>
  );
}

export function DashboardError() {
  const router = useRouter();
  return (
    <PageLayout>
      <div className="flex flex-col items-start gap-4">
        <p role="alert" className="text-sm text-danger">
          Could not load your dashboard. Please try again.
        </p>
        <Button
          onClick={() => {
            void router.invalidate();
          }}
        >
          Try again
        </Button>
      </div>
    </PageLayout>
  );
}
