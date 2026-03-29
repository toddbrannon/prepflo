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

export default router;
