import { Suspense } from "react";

import { SessionInfo } from "@/features/auth/components/session-info";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Hello world</h1>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading session...</p>}>
        <SessionInfo />
      </Suspense>
    </main>
  );
}
