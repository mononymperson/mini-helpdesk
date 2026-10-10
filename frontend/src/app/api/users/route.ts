import { listUsers } from "@/api/users";
import { getCurrentUser } from "@/features/auth/data";
import { getAccessToken } from "@/features/auth/session";

export async function GET() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return Response.json({ message: "Not authenticated" }, { status: 401 });
  }

  if (currentUser.role !== "admin") {
    return Response.json({ message: "Not found" }, { status: 404 });
  }

  const accessToken = await getAccessToken();

  if (!accessToken) {
    return Response.json({ message: "Not authenticated" }, { status: 401 });
  }

  const { data, message } = await listUsers(accessToken);

  if (!data) {
    return Response.json(
      { message: message || "Failed to load users" },
      { status: 502 },
    );
  }

  return Response.json(data);
}
