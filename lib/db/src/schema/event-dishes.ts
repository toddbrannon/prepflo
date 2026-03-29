import { integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { dishesTable } from "./dishes";
import { eventsTable } from "./events";

export const eventDishesTable = pgTable("event_dishes", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => eventsTable.id, { onDelete: "cascade" }),
  dishId: uuid("dish_id")
    .notNull()
    .references(() => dishesTable.id, { onDelete: "restrict" }),
  quantity: integer("quantity"),
  notes: text("notes"),
});

export const insertEventDishSchema = createInsertSchema(eventDishesTable).omit({
  id: true,
});

export type InsertEventDish = z.infer<typeof insertEventDishSchema>;
export type EventDish = typeof eventDishesTable.$inferSelect;
