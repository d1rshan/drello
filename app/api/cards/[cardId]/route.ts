import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { cardsTable, listsTable } from "@/lib/db/schema";
import { currentUser, isABoardMember } from "@/lib/server-utils";

//TODO: should we check for isABoardMember here?
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ cardId: string }> }
) {
  const p = await params;
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse("Not Authorized", { status: 401 });
    }
    const { listId, title, position } = await req.json();

    const [card] = await db
      .update(cardsTable)
      .set({ listId, position, title })
      .where(eq(cardsTable.id, p.cardId))
      .returning();

    return NextResponse.json(card);
  } catch (error) {
    console.log("[CARD_ID_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ cardId: string }> }
) {
  const p = await params;
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse("Not Authorized", { status: 401 });
    }

    const [card] = await db
      .delete(cardsTable)
      .where(eq(cardsTable.id, p.cardId))
      .returning();

    return NextResponse.json(card);
  } catch (error) {
    console.log("[LIST_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
