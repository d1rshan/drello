import {
  integer,
  pgTable,
  varchar,
  uuid,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("first_name", { length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});

// one to many relation - users to boards
export const boardsTable = pgTable(
  "boards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull(),
    userId: uuid("user_id")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
  },
  (t) => [index("user_id_index").on(t.userId)] // we are not using uniqueIndex cause many boards can have the same userId
);

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
  (t) => [index("board_id_index").on(t.boardId)]
);

// one to many relation - lists to cards
export const cardsTable = pgTable(
  "cards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull(),
    postition: integer("position").notNull(),
    listId: uuid("list_id").references(() => listsTable.id, {
      onDelete: "cascade",
    }),
  },
  (t) => [index("list_id_index").on(t.listId)]
);
