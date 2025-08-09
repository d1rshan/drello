import { db } from "@/lib/db";
import { listsTable } from "@/lib/db/schema";
import { currentUser, isABoardMember } from "@/lib/server-utils";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse("Not Authorized", { status: 401 });
    }

    const { boardId, title, position } = await req.json();

    const isMember = await isABoardMember(user.id, boardId);

    if (!isMember) {
      return new NextResponse("Forbidden", { status: 404 });
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
