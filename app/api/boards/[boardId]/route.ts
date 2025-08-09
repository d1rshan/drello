import { NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";

import { db } from "@/lib/db";
import { boardsTable, cardsTable, listsTable } from "@/lib/db/schema";
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

    await sleep(1000);
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

    const [board] = await db
      .delete(boardsTable)
      .where(eq(boardsTable.id, p.boardId))
      .returning();

    await sleep();
    return NextResponse.json(board);
  } catch (error) {
    console.log("[BOARD_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(
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

    if (!isMember) {
      return new NextResponse("Not Authorized", { status: 401 });
    }

    // here we are fetching board {lists: [], cards: []}
    // 1. Fetch all lists that belong to the given boardId
    const lists = await db
      .select()
      .from(listsTable)
      .where(eq(listsTable.boardId, p.boardId));

    // If there are no lists, there can't be any cards, so we can return early.
    if (lists.length === 0) {
      return { lists: [], cards: [] };
    }

    // 2. Extract the IDs from the lists we just fetched
    const listIds = lists.map((list) => list.id);

    // 3. Fetch all cards where the listId is in our array of listIds
    const cards = await db
      .select()
      .from(cardsTable)
      .where(inArray(cardsTable.listId, listIds));

    // 4. Return the data in the desired shape
    return NextResponse.json({ lists, cards });
  } catch (error) {
    console.log("[BOARD_ID_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
