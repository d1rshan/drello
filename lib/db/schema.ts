import {
  integer,
  pgTable,
  varchar,
  uuid,
  index,
  uniqueIndex,
  pgEnum,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});

export const boardsTable = pgTable("boards", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
});

// one to many relation - boards to lists
export const listsTable = pgTable(
  "lists",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull(),
    position: integer("position").notNull(),
    boardId: uuid("board_id").references(() => boardsTable.id, {
      onDelete: "cascade",
    }),
  },
  (t) => [index("board_id_index").on(t.boardId)] // we are not using uniqueIndex cause many lists can have the same boardId
);

// one to many relation - lists to cards
export const cardsTable = pgTable(
  "cards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull(),
    position: integer("position").notNull(),
    listId: uuid("list_id").references(() => listsTable.id, {
      onDelete: "cascade",
    }),
  },
  (t) => [index("list_id_index").on(t.listId)]
);

export const rolesEnum = pgEnum("roles", ["GUEST", "ADMIN"]);

// many to many relation - users & boards
export const boardMembersTable = pgTable(
  "board_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => usersTable.id, {
      onDelete: "cascade",
    }),
    boardId: uuid("board_id").references(() => boardsTable.id, {
      onDelete: "cascade",
    }),
    role: rolesEnum().default("GUEST"),
  },
  (t) => [uniqueIndex("user_id_board_id_index").on(t.userId, t.boardId)]
);
