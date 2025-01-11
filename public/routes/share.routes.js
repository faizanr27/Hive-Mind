"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const auth_middleware_1 = require("../middlewares/auth.middleware");
const controller = require("../controllers/share.controllers");
router.post("/Share", auth_middleware_1.verifyToken, controller.shareLink);
router.get("/Share/:shareLink", controller.getSharedContent);
exports.default = router;
