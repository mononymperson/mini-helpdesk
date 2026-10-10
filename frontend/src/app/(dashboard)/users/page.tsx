import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { requireRole } from "@/features/auth/guards";
import { UsersView } from "@/features/users/components/users-view";

function UsersSkeleton() {
  return (
    <div className="px-4 lg:px-6">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="mt-6 h-64 w-full" />
    </div>
  );
}

async function UsersContent() {
  await requireRole("admin");

  return <UsersView />;
}

export default function UsersPage() {
  return (
    <Suspense fallback={<UsersSkeleton />}>
      <UsersContent />
    </Suspense>
  );
}
