import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { ZodError } from "zod";
import healthRouter from "./health";
import authRouter from "./auth";
import dishesRouter from "./dishes";
import eventsRouter from "./events";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(dishesRouter);
router.use(eventsRouter);

// Validation error handler — catches ZodErrors thrown by any route above
router.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    res.status(400).json({ error: "Validation error", issues: err.issues });
    return;
  }
  throw err;
});

export default router;
