import { date, json, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// Shapes stored as JSON inside each event row
type EventPrepItemJson = {
  prepItemId: string;
  name: string;
  qty: string;
  location: string;
  allergyNote: string;
};

type EventDishJson = {
  dishId: string;
  name: string;
  category: string;
  subNote: string;
  prepItems: EventPrepItemJson[];
};

export const eventsTable = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  client: text("client"),
  date: date("date"),                              // nullable — frontend allows empty
  startTime: text("start_time"),
  guestCount: text("guest_count"),                 // text to match frontend string type
  venue: text("venue"),
  onsiteContact: text("onsite_contact"),
  allergies: text("allergies"),
  notes: text("notes"),
  dishes: json("dishes").$type<EventDishJson[]>(),
  savedAt: text("saved_at"),                       // ISO string
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertEventSchema = createInsertSchema(eventsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof eventsTable.$inferSelect;
