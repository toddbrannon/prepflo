import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/auth";

// Extend Express Request so req.user is available in route handlers
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string };
    }
  }
}

// Paths that do not require a JWT. All other /api/* routes are protected.
const PUBLIC: Array<{ method: string; path: string }> = [
  { method: "GET",  path: "/api/healthz" },
  { method: "POST", path: "/api/auth/login" },
];

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const isPublic = PUBLIC.some(
    (p) => p.method === req.method && p.path === req.path,
  );
  if (isPublic) {
    next();
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
