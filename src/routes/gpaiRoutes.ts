import express, { Request, Response } from "express";

import { runImage } from "../controllers/saas/image";
import { runObject } from "../controllers/saas/object";
import { runStructured } from "../controllers/saas/structured";
import { settingStore } from "../store";
import { runGpai } from "../controllers/gpai/gpaiController";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.json({ message: "Welcome to the API" });
});

router.post("/run-gpai", (req: Request, res: Response) => {
  const { pipeline, projectId, userId, instanceId, ipAddress } = req.body;

  settingStore({
    projectId,
    userId,
    instanceId,
    ipAddress,
    credits: 2,
  });
  runGpai(req, res);
});

export default router;
