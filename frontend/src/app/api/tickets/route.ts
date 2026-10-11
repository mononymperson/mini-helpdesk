import { listTickets } from "@/api/tickets";
import { getCurrentUser } from "@/features/auth/data";
import { getAccessToken } from "@/features/auth/session";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return Response.json({ message: "Not authenticated" }, { status: 401 });
  }

  const accessToken = await getAccessToken();

  if (!accessToken) {
    return Response.json({ message: "Not authenticated" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const search = searchParams.get("search") || "";

  const { data, message } = await listTickets(accessToken);

  if (!data) {
    return Response.json(
      { message: message || "Failed to load tickets" },
      { status: 502 },
    );
  }

  let filtered = data;
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = data.filter((t: any) =>
      t.subject?.toLowerCase().includes(q) ||
      t.id?.toString().includes(q) ||
      t.customer?.name?.toLowerCase().includes(q) ||
      t.category?.toLowerCase().includes(q)
    );
  }

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  return Response.json({
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
}
