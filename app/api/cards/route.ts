import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { cardsTable } from "@/lib/db/schema";
import { currentUser, isABoardMember } from "@/lib/server-utils";

export async function POST(req: Request) {
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse("Not Authorized", { status: 401 });
    }

    const { boardId, title, position, listId } = await req.json();
    const isMember = await isABoardMember(user.id, boardId);

    if (!isMember) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const [card] = await db
      .insert(cardsTable)
      .values({
        listId,
        position,
        title,
      })
      .returning();

    return NextResponse.json(card);
  } catch (error) {
    console.log("[CARDS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
