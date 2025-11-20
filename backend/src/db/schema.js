import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

// Generic favorites table that works with any module type
export const favoritesTable = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  moduleType: text("module_type").notNull(), // 'recipes', 'movies', 'books', etc.
  itemId: text("item_id").notNull(), // ID from external API
  data: text("data").notNull(), // JSON string of full item data
  createdAt: timestamp("created_at").defaultNow(),
});
