import { json, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const categoryEnum = pgEnum("category", [
  "Boards",
  "Passed Appetizers",
  "Sides / Salads",
  "Entrees",
  "Desserts",
  "Custom",
]);

// Shape of prep items stored as JSON inside each dish row
type PrepItemJson = {
  id: string;
  name: string;
  defaultQty: string;
  allergyNote: string;
};

export const dishesTable = pgTable("dishes", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  category: categoryEnum("category").notNull(),
  unit: text("unit"),
  prepNotes: text("prep_notes"),
  prepItems: json("prep_items").$type<PrepItemJson[]>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDishSchema = createInsertSchema(dishesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertDish = z.infer<typeof insertDishSchema>;
export type Dish = typeof dishesTable.$inferSelect;
