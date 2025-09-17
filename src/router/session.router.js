import express from "express";
import sessionController from "../controller/session.controller.js";

const router = express.Router();

router.post("/start", sessionController.startSession);
router.get("/history/:sessionId", sessionController.getHistory);
router.delete("/delete/:sessionId", sessionController.deleteSession);

export default router;
