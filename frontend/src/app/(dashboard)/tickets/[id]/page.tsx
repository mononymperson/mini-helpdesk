import { Suspense } from "react";

import { SetBreadcrumb } from "@/components/breadcrumb-context";
import { Skeleton } from "@/components/ui/skeleton";
import { requireRole } from "@/features/auth/guards";
import { TicketDetailView } from "@/features/tickets/components/ticket-detail-view";

function TicketDetailSkeleton() {
  return (
    <div className="px-4 lg:px-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="mt-2 h-4 w-48" />
      <Skeleton className="mt-6 h-96 w-full" />
    </div>
  );
}

async function TicketDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireRole("admin", "agent", "customer");
  const { getAccessToken } = await import("@/features/auth/session");
  const accessToken = await getAccessToken();

  return (
    <>
      <SetBreadcrumb
        items={[
          { label: "Tickets", href: "/tickets" },
          { label: "Ticket detail" },
        ]}
      />

      <TicketDetailView
        ticketId={Number(id)}
        role={user.role}
        currentUserId={user.id}
        accessToken={accessToken}
      />
    </>
  );
}

export default function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<TicketDetailSkeleton />}>
      <TicketDetailContent params={params} />
    </Suspense>
  );
}
