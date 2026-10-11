import { listMessages } from "@/api/tickets";
import { getCurrentUser } from "@/features/auth/data";
import { getAccessToken } from "@/features/auth/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return Response.json({ message: "Not authenticated" }, { status: 401 });
  }

  const accessToken = await getAccessToken();

  if (!accessToken) {
    return Response.json({ message: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const { data, message } = await listMessages(Number(id), accessToken);

  if (!data) {
    return Response.json(
      { message: message || "Failed to load messages" },
      { status: 502 },
    );
  }

  return Response.json(data);
}
