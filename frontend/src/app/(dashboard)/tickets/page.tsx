import { Suspense } from "react";

import { SetBreadcrumb } from "@/components/breadcrumb-context";
import { Skeleton } from "@/components/ui/skeleton";
import { requireRole } from "@/features/auth/guards";
import { TicketsView } from "@/features/tickets/components/tickets-view";

function TicketsSkeleton() {
  return (
    <div className="px-4 lg:px-6">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="mt-6 h-64 w-full" />
    </div>
  );
}

async function TicketsContent() {
  const user = await requireRole("admin", "agent", "customer");

  return <TicketsView role={user.role} currentUserId={user.id} />;
}

export default function TicketsPage() {
  return (
    <>
      <SetBreadcrumb
        items={[
          { label: "Tickets" },
        ]}
      />
      <Suspense fallback={<TicketsSkeleton />}>
        <TicketsContent />
      </Suspense>
    </>
  );
}
