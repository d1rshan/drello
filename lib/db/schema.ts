import { integer, pgTable, varchar, uuid } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("first_name", { length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});
