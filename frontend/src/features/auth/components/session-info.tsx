import { Button } from "@/components/ui/button";
import { logoutAction } from "@/features/auth/actions";
import { getCurrentUser } from "@/features/auth/data";

export async function SessionInfo() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
      {user && (
        <p>
          Signed in as {user.name} ({user.email})
        </p>
      )}
      <form action={logoutAction}>
        <Button type="submit" variant="outline">
          Log out
        </Button>
      </form>
    </div>
  );
}
