import { db } from "@/lib/db";
import { listsTable } from "@/lib/db/schema";
import { currentUser, isABoardMember } from "@/lib/server-utils";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ listId: string }> }
) {
  const p = await params;
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse("Not Authorized", { status: 401 });
    }
    const { boardId, title, position } = await req.json();

    const isMember = await isABoardMember(user.id, boardId);

    if (!isMember) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const [list] = await db
      .update(listsTable)
      .set({ title, position })
      .returning();

    return NextResponse.json(list);
  } catch (error) {
    console.log("[LIST_ID_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
