import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import {
  db,
  eventsTable,
  eventDishesTable,
  dishesTable,
  insertEventSchema,
  insertEventDishSchema,
} from "@workspace/db";

const router: IRouter = Router();

const uuidParam = z.object({ id: z.string().uuid() });
const uuidParams = z.object({
  id: z.string().uuid(),
  dishId: z.string().uuid(),
});

// Body schema for adding a dish to an event — eventId comes from the URL
const addEventDishSchema = insertEventDishSchema.omit({ eventId: true });

// GET /api/events
router.get("/events", async (_req, res) => {
  const events = await db.select().from(eventsTable).orderBy(eventsTable.date);
  res.json(events);
});

// POST /api/events
router.post("/events", async (req, res) => {
  const body = insertEventSchema.parse(req.body);
  const [event] = await db.insert(eventsTable).values(body).returning();
  res.status(201).json(event);
});

// PUT /api/events/:id
router.put("/events/:id", async (req, res) => {
  const { id } = uuidParam.parse(req.params);
  const body = insertEventSchema.parse(req.body);
  const [event] = await db
    .update(eventsTable)
    .set(body)
    .where(eq(eventsTable.id, id))
    .returning();
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  res.json(event);
});

// DELETE /api/events/:id
router.delete("/events/:id", async (req, res) => {
  const { id } = uuidParam.parse(req.params);
  const [event] = await db
    .delete(eventsTable)
    .where(eq(eventsTable.id, id))
    .returning();
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  res.status(204).send();
});

// GET /api/events/:id/dishes
router.get("/events/:id/dishes", async (req, res) => {
  const { id } = uuidParam.parse(req.params);
  const rows = await db
    .select({
      id: eventDishesTable.id,
      eventId: eventDishesTable.eventId,
      quantity: eventDishesTable.quantity,
      notes: eventDishesTable.notes,
      dish: dishesTable,
    })
    .from(eventDishesTable)
    .innerJoin(dishesTable, eq(eventDishesTable.dishId, dishesTable.id))
    .where(eq(eventDishesTable.eventId, id));
  res.json(rows);
});

// POST /api/events/:id/dishes
router.post("/events/:id/dishes", async (req, res) => {
  const { id } = uuidParam.parse(req.params);
  const body = addEventDishSchema.parse(req.body);
  const [row] = await db
    .insert(eventDishesTable)
    .values({ ...body, eventId: id })
    .returning();
  res.status(201).json(row);
});

// DELETE /api/events/:id/dishes/:dishId
router.delete("/events/:id/dishes/:dishId", async (req, res) => {
  const { id, dishId } = uuidParams.parse(req.params);
  const [row] = await db
    .delete(eventDishesTable)
    .where(
      and(
        eq(eventDishesTable.eventId, id),
        eq(eventDishesTable.dishId, dishId),
      ),
    )
    .returning();
  if (!row) {
    res.status(404).json({ error: "Event dish not found" });
    return;
  }
  res.status(204).send();
});

export default router;
