import { AppSidebar } from "@/components/app-sidebar";
import { getNavItems } from "@/components/nav-items";
import { getCurrentUser } from "@/features/auth/data";

export async function DashboardSidebar() {
  const user = await getCurrentUser();
  const items = getNavItems(user?.role ?? "customer");

  return (
    <AppSidebar
      variant="inset"
      items={items}
      user={
        user ? { name: user.name, email: user.email, avatar: "" } : undefined
      }
    />
  );
}
