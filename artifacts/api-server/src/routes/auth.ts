import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
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

// GET /api/auth/me — requires JWT (enforced by authMiddleware in app.ts)
router.get("/auth/me", (req, res) => {
  res.json({ user: req.user });
});

const seedSchema = z.object({ secret: z.string().min(1) });

const DEMO_EMAIL = "demo@prepflo.com";
const DEMO_PASSWORD = "PrepFlo2026!";

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
