import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { currentUser } from "@/lib/utils";
import { db } from "@/lib/db";
import { boardMembersTable, boardsTable } from "@/lib/db/schema";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const p = await params;
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse("Not Authorized", { status: 401 });
    }

    const { title } = await req.json();

    if (!title) {
      return new NextResponse("Board Title is Required", { status: 400 });
    }

    const [boardMember] = await db
      .select()
      .from(boardMembersTable)
      .where(
        and(
          eq(boardMembersTable.userId, user.id),
          eq(boardMembersTable.boardId, p.boardId)
        )
      );

    if (!boardMember || boardMember.role !== "ADMIN") {
      return new NextResponse("Not Authorized", { status: 401 });
    }

    const [board] = await db
      .update(boardsTable)
      .set({
        title,
      })
      .where(eq(boardsTable.id, p.boardId))
      .returning();

    return NextResponse.json(board);
  } catch (error) {
    console.log("[BOARD_ID_PATCH]");
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const p = await params;
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse("Not Authorized", { status: 401 });
    }

    const [boardMember] = await db
      .select()
      .from(boardMembersTable)
      .where(
        and(
          eq(boardMembersTable.userId, user.id),
          eq(boardMembersTable.boardId, p.boardId)
        )
      );

    if (!boardMember || boardMember.role !== "ADMIN") {
      return new NextResponse("Not Authorized", { status: 401 });
    }

    const board = await db
      .delete(boardsTable)
      .where(eq(boardsTable.id, p.boardId));

    return NextResponse.json(board);
  } catch (error) {
    console.log("[BOARD_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
