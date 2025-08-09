import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { listsTable } from "@/lib/db/schema";
import { currentUser, isABoardMember } from "@/lib/server-utils";

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
      .where(eq(listsTable.id, p.listId))
      .returning();

    return NextResponse.json(list);
  } catch (error) {
    console.log("[LIST_ID_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ listId: string }> }
) {
  const p = await params;
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse("Not Authorized", { status: 401 });
    }
    const { boardId } = await req.json();

    const isMember = await isABoardMember(user.id, boardId);

    if (!isMember) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const list = await db.delete(listsTable).where(eq(listsTable.id, p.listId));

    return NextResponse.json(list);
  } catch (error) {
    console.log("[LIST_ID_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
