import { Router } from "express";
import type { Request, Response } from "express";
import otpRoutes from "./api/otp";

const router = Router();

router.get("/healthcheck", (req: Request, res: Response) => {
  res.status(200).json({ message: "ok", timestamp: new Date().toISOString() });
});

router.use("/:version/otp", otpRoutes);

export default router;
