import { Router, type IRouter } from "express";
import { eq, like } from "drizzle-orm";
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
import { DEMO_DISHES, DEMO_EVENTS } from "../lib/demo-seed-data";

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
    console.log("[demo-login] ensured user:", userId);

    // Clear any old demo data and seed fresh
    await clearDemoData(userId);
    console.log("[demo-login] cleared old data");
    
    await seedDemoData(userId);
    console.log("[demo-login] seeded new data");

    // Keep only one demo session per user to avoid stale-session confusion.
    await db.delete(demoSessionsTable).where(eq(demoSessionsTable.userId, userId));

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

    console.log("[demo-login] created demo session:", session.id);

    // Create JWT token with session reference
    const jwtToken = signToken({ sub: userId, email: DEMO_EMAIL });

    res.json({
      token: jwtToken,
      demoSessionId: session.id,
      expiresAt: session.expiresAt.toISOString(),
      durationMinutes: DEMO_SESSION_DURATION_MINUTES,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : "";
    console.error("[demo-login] error:", errorMsg);
    console.error("[demo-login] stack:", errorStack);
    res.status(500).json({ error: "Failed to start demo session", details: errorMsg });
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
  try {
    // Insert demo dishes
    const insertedDishes = [];
    for (const dish of DEMO_DISHES) {
      const [inserted] = await db
        .insert(dishesTable)
        .values({
          name: `${DEMO_TAG}${dish.name}`,
          category: dish.category,
          prepItems: dish.prepItems,
        })
        .returning({ id: dishesTable.id });
      insertedDishes.push(inserted);
    }
    console.log("[seedDemoData] inserted", insertedDishes.length, "dishes");

    if (insertedDishes.length > 0) {
      const insertedEvents = await db
        .insert(eventsTable)
        .values(
          DEMO_EVENTS.map((event) => ({
            ...event,
            name: `${DEMO_TAG}${event.name}`,
            savedAt: new Date().toISOString(),
          })),
        )
        .returning({ id: eventsTable.id, name: eventsTable.name });
      console.log("[seedDemoData] inserted events:", insertedEvents.map((event) => event.name));
    }
  } catch (error) {
    console.error("[seedDemoData] error:", error);
    throw error;
  }
}

// Prefix used to identify demo-owned rows — never remove this from demo inserts.
const DEMO_TAG = "[DEMO] ";

// Helper: Clear all demo data (only rows tagged with DEMO_TAG — never touches real user data)
async function clearDemoData(_userId: string) {
  try {
    await db.delete(eventsTable).where(like(eventsTable.name, `${DEMO_TAG}%`));
    console.log("[clearDemoData] deleted demo events");
    await db.delete(dishesTable).where(like(dishesTable.name, `${DEMO_TAG}%`));
    console.log("[clearDemoData] deleted demo dishes");
  } catch (error) {
    console.error("[clearDemoData] error:", error);
    throw error;
  }
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
