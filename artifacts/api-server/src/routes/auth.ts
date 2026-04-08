import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import {
  db,
  usersTable,
  demoSessionsTable,
  dishesTable,
  eventsTable,
} from "@workspace/db";
import { signToken } from "../lib/auth";

const router: IRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /api/auth/login
router.post("/auth/login", async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  // Use a constant-time comparison path regardless of whether the user exists
  // to avoid leaking whether an email is registered.
  const hash = user?.passwordHash ?? "$2a$12$invalidhashfortimingnormalization";
  const valid = await bcrypt.compare(password, hash);

  if (!user || !valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = signToken({ sub: user.id, email: user.email });
  res.json({ token });
});

// POST /api/auth/logout — stateless; client discards the token
router.post("/auth/logout", (_req, res) => {
  res.json({ message: "Logged out" });
});

// POST /api/auth/demo-login — start a demo session
router.post("/auth/demo-login", async (req, res) => {
  try {
    // Get or create demo user
    const userId = await ensureDemoUser();

    // Clear any old demo data and seed fresh
    await clearDemoData(userId);
    await seedDemoData(userId);

    // Create a demo session with 4-minute expiration
    const demoToken = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + DEMO_SESSION_DURATION_MINUTES * 60 * 1000);

    const [session] = await db
      .insert(demoSessionsTable)
      .values({
        userId,
        token: demoToken,
        expiresAt,
      })
      .returning({ id: demoSessionsTable.id, expiresAt: demoSessionsTable.expiresAt });

    // Create JWT token with session reference
    const jwtToken = signToken({ sub: userId, email: DEMO_EMAIL });

    res.json({
      token: jwtToken,
      demoSessionId: session.id,
      expiresAt: session.expiresAt.toISOString(),
      durationMinutes: DEMO_SESSION_DURATION_MINUTES,
    });
  } catch (error) {
    console.error("Demo login error:", error);
    res.status(500).json({ error: "Failed to start demo session" });
  }
});

// GET /api/auth/me — requires JWT (enforced by authMiddleware in app.ts)
router.get("/auth/me", (req, res) => {
  res.json({ user: req.user });
});

const DEMO_EMAIL = "demo@prepflo.com";
const DEMO_PASSWORD = "PrepFlo2026!";
const DEMO_SESSION_DURATION_MINUTES = 4;

// Helper: Create or get the demo user
async function ensureDemoUser() {
  const [existing] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, DEMO_EMAIL))
    .limit(1);

  if (existing) {
    return existing.id;
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const [user] = await db
    .insert(usersTable)
    .values({ email: DEMO_EMAIL, passwordHash })
    .returning({ id: usersTable.id });

  return user.id;
}

// Helper: Seed initial demo data for a user
async function seedDemoData(userId: string) {
  // Define default demo items
  const DEMO_DISHES = [
    {
      name: "Cheese & Charcuterie Board",
      category: "Boards" as const,
      prepItems: [
        { id: "prep-1", name: "Assemble board", defaultQty: "1", allergyNote: "Dairy, nuts" },
      ],
    },
    {
      name: "Shrimp Crostini",
      category: "Passed Appetizers" as const,
      prepItems: [
        { id: "prep-2", name: "Toast bread", defaultQty: "24", allergyNote: "Gluten" },
        { id: "prep-3", name: "Top with shrimp", defaultQty: "24", allergyNote: "Shellfish" },
      ],
    },
    {
      name: "Caprese Salad",
      category: "Sides / Salads" as const,
      prepItems: [
        { id: "prep-4", name: "Slice tomatoes", defaultQty: "2 lbs", allergyNote: "" },
        { id: "prep-5", name: "Cube mozzarella", defaultQty: "1 lb", allergyNote: "Dairy" },
      ],
    },
    {
      name: "Herb Roasted Chicken",
      category: "Entrees" as const,
      prepItems: [
        { id: "prep-6", name: "Season & roast", defaultQty: "2 chickens", allergyNote: "" },
        { id: "prep-7", name: "Rest & carve", defaultQty: "15 min", allergyNote: "" },
      ],
    },
    {
      name: "Chocolate Mousse",
      category: "Desserts" as const,
      prepItems: [
        { id: "prep-8", name: "Make mousse", defaultQty: "12 servings", allergyNote: "Dairy, nuts" },
        { id: "prep-9", name: "Chill", defaultQty: "2 hours", allergyNote: "" },
      ],
    },
  ];

  // Insert demo dishes
  const insertedDishes = [];
  for (const dish of DEMO_DISHES) {
    const [inserted] = await db
      .insert(dishesTable)
      .values({
        name: dish.name,
        category: dish.category,
        prepItems: dish.prepItems,
      })
      .returning({ id: dishesTable.id });
    insertedDishes.push(inserted);
  }

  // Insert a sample demo event
  if (insertedDishes.length > 0) {
    await db.insert(eventsTable).values({
      name: "Sample Wedding Reception",
      client: "John & Jane Smith",
      date: new Date().toISOString().split("T")[0],
      startTime: "18:00",
      guestCount: "75",
      venue: "Grand Ballroom",
      onsiteContact: "Sarah Johnson",
      allergies: "See prep notes",
      notes: "Demo event - data will reset in 4 minutes",
      dishes: [
        {
          dishId: insertedDishes[0].id,
          name: "Cheese & Charcuterie Board",
          category: "Boards",
          subNote: "Start 1 hour before guests",
          prepItems: [{ prepItemId: "prep-1", name: "Assemble board", qty: "1", location: "Kitchen", allergyNote: "Dairy, nuts" }],
        },
        {
          dishId: insertedDishes[1].id,
          name: "Shrimp Crostini",
          category: "Passed Appetizers",
          subNote: "Serve immediately after prep",
          prepItems: [
            { prepItemId: "prep-2", name: "Toast bread", qty: "24", location: "Oven", allergyNote: "Gluten" },
            { prepItemId: "prep-3", name: "Top with shrimp", qty: "24", location: "Prep Station", allergyNote: "Shellfish" },
          ],
        },
      ],
      savedAt: new Date().toISOString(),
    });
  }
}

// Helper: Clear all demo data for a user
async function clearDemoData(userId: string) {
  // Delete all events (and related event_dishes via cascade)
  await db.delete(eventsTable);
  // Delete all dishes
  await db.delete(dishesTable);
}

const seedSchema = z.object({ secret: z.string().min(1) });

// POST /api/auth/seed-demo-user — idempotent, guarded by SEED_SECRET
router.post("/auth/seed-demo-user", async (req, res) => {
  const seedSecret = process.env.SEED_SECRET;
  if (!seedSecret) {
    res.status(503).json({ error: "Seeding is not enabled on this server" });
    return;
  }

  const { secret } = seedSchema.parse(req.body);
  if (secret !== seedSecret) {
    res.status(403).json({ error: "Invalid seed secret" });
    return;
  }

  const [existing] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, DEMO_EMAIL))
    .limit(1);

  if (existing) {
    res.json({ created: false, message: "Demo user already exists" });
    return;
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const [user] = await db
    .insert(usersTable)
    .values({ email: DEMO_EMAIL, passwordHash })
    .returning({ id: usersTable.id, email: usersTable.email });

  res.status(201).json({ created: true, user });
});

export default router;
