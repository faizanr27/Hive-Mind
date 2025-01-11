import express from "express";
const router = express.Router();
import {verifyToken} from "../middlewares/auth.middleware";
const controller = require("../controllers/share.controllers");

router.post("/Share", verifyToken, controller.shareLink);
router.get("/Share/:shareLink", controller.getSharedContent);

export default router