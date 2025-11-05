// This is the database Schema definition file that is used by drizzle to create the structure of the databases.
// It gets generated with 'npx drizzle-kit generate", and applied with 'npx drizzle-kit migrate'
import { pgTable, timestamp, uuid, text, unique } from "drizzle-orm/pg-core";


// This is the users table, we define it here so that drizzle knows about the DB schema and we can enforce type constraints on what gets inserted/read from the table.
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  name: text("name").notNull().unique(),
});


// This is the feeds table.
export const feeds = pgTable("feeds", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  name: text("name").notNull(),
  url: text("url").notNull().unique(),
  user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' })
});

export const feedsFollows = pgTable("feed_follows", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  feed_id: uuid("feed_id").notNull().references(() => feeds.id, { onDelete: 'cascade' })
}, (t) => [unique().on(t.user_id, t.feed_id)]
);
