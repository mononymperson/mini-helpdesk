import { Suspense } from "react";

import { SetBreadcrumb } from "@/components/breadcrumb-context";
import { Skeleton } from "@/components/ui/skeleton";
import { requireRole } from "@/features/auth/guards";
import { NewTicketView } from "@/features/tickets/components/new-ticket-view";

function NewTicketSkeleton() {
  return (
    <div className="px-4 lg:px-6">
      <Skeleton className="h-96 w-full max-w-2xl" />
    </div>
  );
}

async function NewTicketContent() {
  await requireRole("customer");

  return <NewTicketView />;
}

export default function NewTicketPage() {
  return (
    <>
      <SetBreadcrumb
        items={[
          { label: "Tickets", href: "/tickets" },
          { label: "New ticket" },
        ]}
      />

      <Suspense fallback={<NewTicketSkeleton />}>
        <NewTicketContent />
      </Suspense>
    </>
  );
}
