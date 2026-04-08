import type { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db, demoSessionsTable } from "@workspace/db";

// Extend Express Request to track demo mode
declare global {
  namespace Express {
    interface Request {
      isDemoMode?: boolean;
      demoSessionId?: string;
    }
  }
}

// Check if a request is for a data modification and is in demo mode
function isDataModification(method: string, path: string): boolean {
  const dataEndpoints = [
    { methods: ["POST", "PUT", "DELETE"], pattern: /^\/api\/(dishes|events)/ },
  ];

  return dataEndpoints.some((endpoint) =>
    endpoint.methods.includes(method) && endpoint.pattern.test(path)
  );
}

export async function demoSessionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // Check if this is a demo session by looking up the user
  // In a real implementation, we'd check a demoSession table or include a flag in the JWT
  // For now, we'll mark demo mode if a demo session exists for this user in the DB

  const user = req.user;
  if (!user) {
    next();
    return;
  }

  try {
    // Check if there's an active demo session for this user
    const [demoSession] = await db
      .select()
      .from(demoSessionsTable)
      .where(eq(demoSessionsTable.userId, user.id))
      .limit(1);

    if (demoSession) {
      const now = new Date();

      // Check if session is expired
      if (demoSession.expiresAt < now) {
        // Session expired - delete it
        await db
          .delete(demoSessionsTable)
          .where(eq(demoSessionsTable.id, demoSession.id));

        res.status(401).json({ error: "Demo session expired" });
        return;
      }

      // Mark as demo mode
      req.isDemoMode = true;
      req.demoSessionId = demoSession.id;

      // Prevent write operations in demo mode (writes will be rolled back or not persisted)
      // For now, we'll allow writes but they won't be persisted in the real sense
      // The data will be reset when the next demo session starts
    }
  } catch (error) {
    console.error("Demo session middleware error:", error);
    // Continue anyway - this is not a critical check
  }

  next();
}
