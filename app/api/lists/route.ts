import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { listsTable } from "@/lib/db/schema";
import { currentUser, isABoardMember } from "@/lib/server-utils";

export async function POST(req: Request) {
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
      .insert(listsTable)
      .values({
        boardId,
        title,
        position,
      })
      .returning();

    return NextResponse.json(list);
  } catch (error) {
    console.log("[LISTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse("Not Authorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    const boardId = searchParams.get("boardId");

    if (!boardId) {
      return new NextResponse("Board Id Missing", { status: 400 });
    }

    const isMember = await isABoardMember(user.id, boardId);

    if (!isMember) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const lists = await db
      .select()
      .from(listsTable)
      .where(eq(listsTable.boardId, boardId));

    return NextResponse.json(lists);
  } catch (error) {
    console.log("[LISTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
