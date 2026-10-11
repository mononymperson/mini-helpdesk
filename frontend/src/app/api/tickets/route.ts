import { listTickets } from "@/api/tickets";
import { getCurrentUser } from "@/features/auth/data";
import { getAccessToken } from "@/features/auth/session";

export async function GET() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return Response.json({ message: "Not authenticated" }, { status: 401 });
  }

  const accessToken = await getAccessToken();

  if (!accessToken) {
    return Response.json({ message: "Not authenticated" }, { status: 401 });
  }

  const { data, message } = await listTickets(accessToken);

  if (!data) {
    return Response.json(
      { message: message || "Failed to load tickets" },
      { status: 502 },
    );
  }

  return Response.json(data);
}
