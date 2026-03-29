import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, dishesTable, insertDishSchema } from "@workspace/db";

const router: IRouter = Router();

const uuidParam = z.object({ id: z.string().uuid() });

// GET /api/dishes
router.get("/dishes", async (_req, res) => {
  const dishes = await db.select().from(dishesTable).orderBy(dishesTable.name);
  res.json(dishes);
});

// POST /api/dishes
router.post("/dishes", async (req, res) => {
  const body = insertDishSchema.parse(req.body);
  const [dish] = await db.insert(dishesTable).values(body).returning();
  res.status(201).json(dish);
});

// PUT /api/dishes/:id
router.put("/dishes/:id", async (req, res) => {
  const { id } = uuidParam.parse(req.params);
  const body = insertDishSchema.parse(req.body);
  const [dish] = await db
    .update(dishesTable)
    .set(body)
    .where(eq(dishesTable.id, id))
    .returning();
  if (!dish) {
    res.status(404).json({ error: "Dish not found" });
    return;
  }
  res.json(dish);
});

// DELETE /api/dishes/:id
router.delete("/dishes/:id", async (req, res) => {
  const { id } = uuidParam.parse(req.params);
  const [dish] = await db
    .delete(dishesTable)
    .where(eq(dishesTable.id, id))
    .returning();
  if (!dish) {
    res.status(404).json({ error: "Dish not found" });
    return;
  }
  res.status(204).send();
});

export default router;
