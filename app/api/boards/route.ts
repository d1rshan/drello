import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { boardMembersTable, boardsTable } from "@/lib/db/schema";
import { currentUser } from "@/lib/auth/current-user";
import { sleep } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse("Not Authorized", { status: 401 });
    }

    const { title } = await req.json();

    if (!title) {
      return NextResponse.json("Board Title is Required", { status: 400 });
    }

    const [board] = await db
      .insert(boardsTable)
      .values({
        title,
      })
      .returning();

    await db.insert(boardMembersTable).values({
      userId: user.id,
      boardId: board.id,
      role: "ADMIN",
    });

    await sleep();
    return NextResponse.json(board);
  } catch (error) {
    console.log("[BOARDS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse("Not Authorized", { status: 401 });
    }

    const boards = await db
      .select({
        id: boardsTable.id,
        title: boardsTable.title,
        role: boardMembersTable.role,
      })
      .from(boardsTable)
      .innerJoin(
        boardMembersTable,
        eq(boardsTable.id, boardMembersTable.boardId)
      )
      .where(eq(boardMembersTable.userId, user.id));

    await sleep();

    return NextResponse.json(boards);
  } catch (error) {
    console.log("[BOARDS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
