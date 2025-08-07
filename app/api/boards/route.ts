import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { boardMembersTable, boardsTable } from "@/lib/db/schema";
import { currentUser } from "@/lib/utils";

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

    return NextResponse.json(board);
  } catch (error) {
    console.log("[BOARDS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
