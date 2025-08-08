import { db } from "./db";
import { boardMembersTable } from "./db/schema";
import { and, eq } from "drizzle-orm";

export function isUUID(value: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  return uuidRegex.test(value);
}

export const sleep = (ms?: number) =>
  new Promise((resolve) => setTimeout(resolve, ms || 200));

export const isABoardMember = async (userId: string, boardId: string) => {
  const [member] = await db
    .select()
    .from(boardMembersTable)
    .where(
      and(
        eq(boardMembersTable.userId, userId),
        eq(boardMembersTable.boardId, boardId)
      )
    );

  if (!member) return null;

  return member;
};
