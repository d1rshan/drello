import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { boardsTable } from "@/lib/db/schema";
import { isABoardMember, sleep, currentUser } from "@/lib/server-utils";

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

    const isMember = await isABoardMember(user.id, p.boardId);

    if (!isMember || isMember.role !== "ADMIN") {
      return new NextResponse("Not Authorized", { status: 401 });
    }

    const [board] = await db
      .update(boardsTable)
      .set({
        title,
      })
      .where(eq(boardsTable.id, p.boardId))
      .returning();

    await sleep();
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

    const isMember = await isABoardMember(user.id, p.boardId);

    if (!isMember || isMember.role !== "ADMIN") {
      return new NextResponse("Not Authorized", { status: 401 });
    }

    const board = await db
      .delete(boardsTable)
      .where(eq(boardsTable.id, p.boardId));

    await sleep();
    return NextResponse.json(board);
  } catch (error) {
    console.log("[BOARD_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
